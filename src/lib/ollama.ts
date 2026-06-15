import { invoke } from "@tauri-apps/api/core"

export type ImageAnalysis = {
  title: string
  description: string
  tags: string[]
}

export type AnalyzeLogHandler = (message: string) => void

export async function analyzeImageWithOllama(
  imagePath: string,
  onLog?: AnalyzeLogHandler
): Promise<ImageAnalysis> {
  onLog?.("准备交给 Rust 后端处理图片，避免浏览器本地图片安全限制")
  onLog?.("后端将读取原图、缩放最长边到 768px，并转为 JPEG")
  onLog?.("正在请求 Ollama，本地模型首次加载可能需要更久...")
  const result = await invoke<ImageAnalysis>("analyze_figure_image", {
    imagePath,
  })
  onLog?.("Ollama 已返回结果，正在填充表单")
  return result
}
