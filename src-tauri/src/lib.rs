use std::fs;
use std::path::PathBuf;
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
fn get_app_data_dir(app: tauri::AppHandle) -> Result<String, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("无法获取 AppData 目录: {e}"))?;
    dir.to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "AppData 路径包含无效 Unicode".to_string())
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
            get_app_data_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
