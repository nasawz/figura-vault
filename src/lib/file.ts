import { open } from "@tauri-apps/plugin-dialog"
import { invoke } from "@tauri-apps/api/core"
import { convertFileSrc } from "@tauri-apps/api/core"

const IMAGE_FILTERS = [
  { name: "图片文件", extensions: ["png", "jpg", "jpeg", "webp"] },
]

let appDataDirCache: string | null = null

export async function getAppDataDir(): Promise<string> {
  if (!appDataDirCache) {
    appDataDirCache = await invoke<string>("get_app_data_dir")
  }
  return appDataDirCache
}

export async function pickImageFile(): Promise<string | null> {
  const result = await open({
    multiple: false,
    directory: false,
    filters: IMAGE_FILTERS,
  })
  return result ?? null
}

export async function importFigureImages(
  figureId: string,
  afterSourcePath: string,
  beforeSourcePath?: string
): Promise<{ afterPath: string; beforePath?: string }> {
  const result = await invoke<{ after_path: string; before_path: string | null }>(
    "import_figure_images",
    {
      figureId,
      afterSourcePath,
      beforeSourcePath: beforeSourcePath ?? null,
    }
  )
  return {
    afterPath: result.after_path,
    beforePath: result.before_path ?? undefined,
  }
}

export async function cleanupFigureImages(figureId: string): Promise<void> {
  await invoke("cleanup_figure_images", { figureId })
}

export async function toImageSrc(relativePath: string): Promise<string> {
  if (
    relativePath.startsWith("/") ||
    relativePath.startsWith("http://") ||
    relativePath.startsWith("https://") ||
    relativePath.startsWith("asset:")
  ) {
    return relativePath
  }
  const appData = await getAppDataDir()
  const sep = appData.endsWith("/") || appData.endsWith("\\") ? "" : "/"
  const absolutePath = `${appData}${sep}${relativePath}`
  return convertFileSrc(absolutePath)
}

export function getImageExtension(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? ""
  return ext
}

export async function copySingleImage(
  figureId: string,
  role: string,
  sourcePath: string,
  imageId: string,
): Promise<string> {
  return invoke<string>("copy_single_image", {
    figureId,
    role,
    sourcePath,
    imageId,
  })
}

export async function deleteAppImage(relativePath: string): Promise<void> {
  await invoke("delete_app_image", { relativePath })
}
