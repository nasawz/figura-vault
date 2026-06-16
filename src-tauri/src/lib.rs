use std::fs;
use std::io::Cursor;
use std::path::PathBuf;
use base64::Engine;
use image::codecs::jpeg::JpegEncoder;
use image::imageops::FilterType;
use image::ImageReader;
use tauri::Manager;
use tauri_plugin_sql::{Builder as SqlBuilder, Migration, MigrationKind};

#[derive(serde::Serialize)]
struct ImportResult {
    after_path: String,
    before_path: Option<String>,
}

fn allowed_extension(path: &str) -> Option<String> {
    let ext = path.rsplit('.').next()?.to_lowercase();
    match ext.as_str() {
        "png" | "jpg" | "jpeg" | "webp" => Some(ext),
        _ => None,
    }
}

#[tauri::command]
fn import_figure_images(
    app: tauri::AppHandle,
    figure_id: String,
    after_source_path: String,
    before_source_path: Option<String>,
) -> Result<ImportResult, String> {
    let after_ext =
        allowed_extension(&after_source_path).ok_or("不支持的图片格式，仅允许 png/jpg/jpeg/webp")?;

    let before_ext = match &before_source_path {
        Some(p) => Some(allowed_extension(p).ok_or("不支持的图片格式，仅允许 png/jpg/jpeg/webp")?),
        None => None,
    };

    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("无法获取 AppData 目录: {e}"))?;

    let images_dir = app_data.join("images").join(&figure_id);

    fs::create_dir_all(&images_dir)
        .map_err(|e| format!("创建图片目录失败: {e}"))?;

    let rollback = |dir: &PathBuf| {
        let _ = fs::remove_dir_all(dir);
    };

    let after_filename = format!("after.{after_ext}");
    let after_dest = images_dir.join(&after_filename);
    if let Err(e) = fs::copy(&after_source_path, &after_dest) {
        rollback(&images_dir);
        return Err(format!("复制 After 图片失败: {e}"));
    }

    let after_relative = format!("images/{figure_id}/{after_filename}");

    let before_relative = if let (Some(src), Some(ext)) = (&before_source_path, &before_ext) {
        let before_filename = format!("before.{ext}");
        let before_dest = images_dir.join(&before_filename);
        if let Err(e) = fs::copy(src, &before_dest) {
            rollback(&images_dir);
            return Err(format!("复制 Before 图片失败: {e}"));
        }
        Some(format!("images/{figure_id}/{before_filename}"))
    } else {
        None
    };

    Ok(ImportResult {
        after_path: after_relative,
        before_path: before_relative,
    })
}

#[tauri::command]
fn cleanup_figure_images(app: tauri::AppHandle, figure_id: String) -> Result<(), String> {
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("无法获取 AppData 目录: {e}"))?;

    let images_dir = app_data.join("images").join(&figure_id);
    if images_dir.exists() {
        fs::remove_dir_all(&images_dir)
            .map_err(|e| format!("清理图片目录失败: {e}"))?;
    }

    Ok(())
}

#[tauri::command]
fn copy_single_image(
    app: tauri::AppHandle,
    figure_id: String,
    role: String,
    source_path: String,
    image_id: String,
) -> Result<String, String> {
    let ext = allowed_extension(&source_path)
        .ok_or("不支持的图片格式，仅允许 png/jpg/jpeg/webp")?;

    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("无法获取 AppData 目录: {e}"))?;

    let images_dir = app_data.join("images").join(&figure_id);
    fs::create_dir_all(&images_dir)
        .map_err(|e| format!("创建图片目录失败: {e}"))?;

    let filename = format!("{role}-{image_id}.{ext}");
    let dest = images_dir.join(&filename);
    fs::copy(&source_path, &dest)
        .map_err(|e| format!("复制图片失败: {e}"))?;

    Ok(format!("images/{figure_id}/{filename}"))
}

#[tauri::command]
fn delete_app_image(app: tauri::AppHandle, relative_path: String) -> Result<(), String> {
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("无法获取 AppData 目录: {e}"))?;

    let full_path = app_data.join(&relative_path);
    if full_path.exists() {
        fs::remove_file(&full_path)
            .map_err(|e| format!("删除图片失败: {e}"))?;
    }
    Ok(())
}

#[tauri::command]
fn get_app_data_dir(app: tauri::AppHandle) -> Result<String, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("无法获取 AppData 目录: {e}"))?;
    dir.to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "AppData 路径包含无效 Unicode".to_string())
}

#[derive(serde::Serialize, serde::Deserialize)]
struct ImageAnalysis {
    title: String,
    description: String,
    tags: Vec<String>,
}

#[derive(serde::Serialize, serde::Deserialize)]
struct OllamaToolCallFunction {
    name: String,
    arguments: serde_json::Value,
}

#[derive(serde::Serialize, serde::Deserialize)]
struct OllamaToolCall {
    function: OllamaToolCallFunction,
}

#[derive(serde::Serialize, serde::Deserialize)]
struct OllamaMessage {
    role: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    images: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    tool_calls: Option<Vec<OllamaToolCall>>,
}

#[derive(serde::Deserialize)]
struct OllamaChatResponse {
    message: OllamaMessage,
}

struct PreparedImage {
    base64: String,
    original_width: u32,
    original_height: u32,
    width: u32,
    height: u32,
    bytes: usize,
}

fn prepare_image_for_ollama(image_path: &str) -> Result<PreparedImage, String> {
    const MAX_LONG_EDGE: u32 = 768;
    const JPEG_QUALITY: u8 = 82;

    let image = ImageReader::open(image_path)
        .map_err(|e| format!("打开图片失败: {e}"))?
        .with_guessed_format()
        .map_err(|e| format!("识别图片格式失败: {e}"))?
        .decode()
        .map_err(|e| format!("解码图片失败: {e}"))?;

    let original_width = image.width();
    let original_height = image.height();
    let long_edge = original_width.max(original_height);
    let (width, height) = if long_edge > MAX_LONG_EDGE {
        let scale = MAX_LONG_EDGE as f32 / long_edge as f32;
        (
            ((original_width as f32 * scale).round() as u32).max(1),
            ((original_height as f32 * scale).round() as u32).max(1),
        )
    } else {
        (original_width, original_height)
    };

    let resized = if width == original_width && height == original_height {
        image
    } else {
        image.resize(width, height, FilterType::Lanczos3)
    };

    let rgb = resized.to_rgb8();
    let mut jpeg_bytes = Vec::new();
    {
        let mut cursor = Cursor::new(&mut jpeg_bytes);
        let mut encoder = JpegEncoder::new_with_quality(&mut cursor, JPEG_QUALITY);
        encoder
            .encode(
                &rgb,
                rgb.width(),
                rgb.height(),
                image::ExtendedColorType::Rgb8,
            )
            .map_err(|e| format!("压缩图片失败: {e}"))?;
    }

    let base64 = base64::engine::general_purpose::STANDARD.encode(&jpeg_bytes);
    Ok(PreparedImage {
        base64,
        original_width,
        original_height,
        width,
        height,
        bytes: jpeg_bytes.len(),
    })
}

fn parse_analysis_from_tool_calls(tool_calls: &[OllamaToolCall]) -> Option<ImageAnalysis> {
    for tc in tool_calls {
        if tc.function.name == "set_figure_metadata" {
            let args = &tc.function.arguments;
            let title = args.get("title")?.as_str()?.to_string();
            let description = args.get("description")?.as_str()?.to_string();
            let tags_val = args.get("tags")?;
            let tags: Vec<String> = tags_val
                .as_array()?
                .iter()
                .filter_map(|v| v.as_str().map(|s| s.trim().to_string()))
                .filter(|s| !s.is_empty())
                .take(6)
                .collect();
            return Some(ImageAnalysis {
                title,
                description,
                tags,
            });
        }
    }
    None
}

fn parse_analysis_from_json_content(content: &str) -> Option<ImageAnalysis> {
    let trimmed = content.trim();

    let json_str = if let Some(start) = trimmed.find('{') {
        if let Some(end) = trimmed.rfind('}') {
            &trimmed[start..=end]
        } else {
            return None;
        }
    } else {
        return None;
    };

    let val: serde_json::Value = serde_json::from_str(json_str).ok()?;
    let title = val.get("title")?.as_str()?.to_string();
    let description = val.get("description")?.as_str()?.to_string();
    let tags: Vec<String> = val
        .get("tags")?
        .as_array()?
        .iter()
        .filter_map(|v| v.as_str().map(|s| s.trim().to_string()))
        .filter(|s| !s.is_empty())
        .take(6)
        .collect();
    Some(ImageAnalysis {
        title,
        description,
        tags,
    })
}

#[tauri::command]
async fn analyze_figure_image(image_path: String) -> Result<ImageAnalysis, String> {
    allowed_extension(&image_path)
        .ok_or("不支持的图片格式，仅允许 png/jpg/jpeg/webp")?;

    let prepared = prepare_image_for_ollama(&image_path)?;
    println!(
        "[ollama] image prepared: original {}x{}, compressed {}x{}, ~{} KB",
        prepared.original_width,
        prepared.original_height,
        prepared.width,
        prepared.height,
        prepared.bytes / 1024
    );
    let tool_schema = serde_json::json!({
        "type": "function",
        "function": {
            "name": "set_figure_metadata",
            "description": "根据图片内容设置手办/收藏品的元数据信息",
            "parameters": {
                "type": "object",
                "required": ["title", "description", "tags"],
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "简短的中文标题，8-18个字，描述图片中手办/物品的主要特征"
                    },
                    "description": {
                        "type": "string",
                        "description": "中文介绍，1-2句话，描述图片内容、风格或特点"
                    },
                    "tags": {
                        "type": "array",
                        "items": { "type": "string" },
                        "description": "3-6个中文短标签，如：可爱、机甲、动物、食物、赛博朋克、桌面摆件等"
                    }
                }
            }
        }
    });

    let body = serde_json::json!({
        "model": "huihui_ai/qwen3.5-abliterated:4b",
        "stream": false,
        "messages": [
            {
                "role": "system",
                "content": "你是一个手办/收藏品图片分析助手。请根据图片内容调用 set_figure_metadata 工具来设置标题、描述和标签。\n规则：\n- 只基于图片实际内容描述，不编造艺术家、来源或人物身份\n- 标题：简短中文，8-18字\n- 描述：中文，1-2句话\n- 标签：3-6个中文短标签\n- 如果你无法调用工具，请直接返回JSON格式：{\"title\":\"...\",\"description\":\"...\",\"tags\":[\"...\"]}"
            },
            {
                "role": "user",
                "content": format!("请分析这张手办/收藏品图片，给出标题、描述和标签。图片已压缩为 {}x{}。", prepared.width, prepared.height),
                "images": [prepared.base64]
            }
        ],
        "tools": [tool_schema]
    });

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(120))
        .build()
        .map_err(|e| format!("创建 HTTP 客户端失败: {e}"))?;

    let response = client
        .post("http://localhost:11434/api/chat")
        .json(&body)
        .send()
        .await
        .map_err(|e| {
            if e.is_connect() {
                "无法连接 Ollama 服务，请确认 Ollama 已启动（默认地址 http://localhost:11434）".to_string()
            } else if e.is_timeout() {
                "Ollama 请求超时，模型可能正在加载或图片过大，请稍后重试".to_string()
            } else {
                format!("请求 Ollama 失败: {e}")
            }
        })?;

    let status = response.status();
    if !status.is_success() {
        let err_text = response.text().await.unwrap_or_default();
        if status.as_u16() == 404 {
            return Err(
                "模型不存在，请先运行 ollama pull huihui_ai/qwen3.5-abliterated:4b".to_string(),
            );
        }
        return Err(format!("Ollama 返回错误 (HTTP {status}): {err_text}"));
    }

    let chat_resp: OllamaChatResponse = response
        .json()
        .await
        .map_err(|e| format!("解析 Ollama 响应失败: {e}"))?;

    if let Some(ref tool_calls) = chat_resp.message.tool_calls {
        if let Some(analysis) = parse_analysis_from_tool_calls(tool_calls) {
            return Ok(analysis);
        }
    }

    if let Some(ref content) = chat_resp.message.content {
        if let Some(analysis) = parse_analysis_from_json_content(content) {
            return Ok(analysis);
        }
    }

    Err("AI 模型未返回有效的分析结果，该模型可能不支持图片识别或工具调用".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_albums_table",
            sql: "CREATE TABLE IF NOT EXISTS albums (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_tags_table",
            sql: "CREATE TABLE IF NOT EXISTS tags (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL UNIQUE,
                color TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create_figures_table",
            sql: "CREATE TABLE IF NOT EXISTS figures (
                id TEXT PRIMARY KEY NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                album_id TEXT,
                category TEXT,
                rating INTEGER NOT NULL DEFAULT 0,
                is_favorite INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "create_figure_images_table",
            sql: "CREATE TABLE IF NOT EXISTS figure_images (
                id TEXT PRIMARY KEY NOT NULL,
                figure_id TEXT NOT NULL,
                image_path TEXT NOT NULL,
                image_role TEXT NOT NULL DEFAULT 'after',
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (figure_id) REFERENCES figures(id) ON DELETE CASCADE
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "create_figure_tags_table",
            sql: "CREATE TABLE IF NOT EXISTS figure_tags (
                figure_id TEXT NOT NULL,
                tag_id TEXT NOT NULL,
                PRIMARY KEY (figure_id, tag_id),
                FOREIGN KEY (figure_id) REFERENCES figures(id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
            );",
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            SqlBuilder::default()
                .add_migrations("sqlite:app.db", migrations)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            import_figure_images,
            cleanup_figure_images,
            copy_single_image,
            delete_app_image,
            get_app_data_dir,
            analyze_figure_image,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
