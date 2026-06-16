import { useState, useEffect } from "react"
import { ImagePlus, X, Loader2, Sparkles, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { Album, Tag, FigureItem } from "@/types/figure"
import { getAfterImage, getBeforeImage } from "@/types/figure"
import { createFigure, updateFigure } from "@/lib/figure"
import { getOrCreateTag } from "@/lib/tag"
import {
  pickImageFile,
  importFigureImages,
  cleanupFigureImages,
  copySingleImage,
  deleteAppImage,
} from "@/lib/file"
import { analyzeImageWithOllama } from "@/lib/ollama"
import { convertFileSrc } from "@tauri-apps/api/core"
import { useImageSrc } from "@/hooks/use-image-src"
import { AlbumFormDialog } from "./AlbumFormDialog"
import { TagInput } from "./TagInput"
import { getAllAlbums } from "@/lib/album"

type FormMode = "create" | "edit"

interface FigureFormDialogProps {
  mode: FormMode
  open: boolean
  onOpenChange: (open: boolean) => void
  albums: Album[]
  tags: Tag[]
  onSaved: () => void
  figure?: FigureItem
}

function ExistingImagePreview({ relativePath, alt }: { relativePath: string; alt: string }) {
  const src = useImageSrc(relativePath)
  if (!src) return null
  return <img src={src} alt={alt} className="size-full object-contain" />
}

export function FigureFormDialog({
  mode,
  open,
  onOpenChange,
  albums,
  tags,
  onSaved,
  figure,
}: FigureFormDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [albumId, setAlbumId] = useState("")
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [isFavorite, setIsFavorite] = useState(false)

  // "local" = newly picked file path on disk; "existing" = kept from DB
  const [afterPath, setAfterPath] = useState<string | null>(null)
  const [afterExisting, setAfterExisting] = useState<string | null>(null)
  const [beforePath, setBeforePath] = useState<string | null>(null)
  const [beforeExisting, setBeforeExisting] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([])
  const [localAlbums, setLocalAlbums] = useState<Album[]>(albums)
  const [isAlbumFormOpen, setIsAlbumFormOpen] = useState(false)

  useEffect(() => {
    setLocalAlbums(albums)
  }, [albums])

  // Prefill when editing
  useEffect(() => {
    if (!open) return
    if (mode === "edit" && figure) {
      setTitle(figure.title)
      setDescription(figure.description ?? "")
      setAlbumId(figure.albumId ?? "")
      setSelectedTags(figure.tags)
      setIsFavorite(figure.isFavorite)
      const afterImg = getAfterImage(figure)
      const beforeImg = getBeforeImage(figure)
      setAfterExisting(afterImg?.imagePath ?? null)
      setBeforeExisting(beforeImg?.imagePath ?? null)
      setAfterPath(null)
      setBeforePath(null)
    } else if (mode === "create") {
      resetForm()
    }
    setError(null)
    setAnalysisLogs([])
  }, [open, mode, figure])

  function resetForm() {
    setTitle("")
    setDescription("")
    setAlbumId("")
    setSelectedTags([])
    setIsFavorite(false)
    setAfterPath(null)
    setAfterExisting(null)
    setBeforePath(null)
    setBeforeExisting(null)
    setError(null)
    setSaving(false)
    setAnalyzing(false)
    setAnalysisLogs([])
  }

  const hasAfter = afterPath !== null || afterExisting !== null
  const hasBefore = beforePath !== null || beforeExisting !== null
  const canSave = title.trim().length > 0 && hasAfter && !saving

  // The path to use for AI analysis — prefer newly picked file, fall back to existing
  const afterAnalyzePath = afterPath ?? null

  async function handleAiAnalyze() {
    if (!afterAnalyzePath || analyzing) return
    setAnalyzing(true)
    setError(null)
    setAnalysisLogs([])
    const appendLog = (message: string) => {
      setAnalysisLogs((prev) => [...prev, message])
    }
    try {
      appendLog("开始 AI 识别流程")
      const result = await analyzeImageWithOllama(afterAnalyzePath, appendLog)
      if (!title.trim()) setTitle(result.title)
      if (!description.trim()) setDescription(result.description)

      const aiTags = result.tags
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .slice(0, 6)

      setSelectedTags((prev) => {
        const existing = new Set(prev.map((t) => t.name))
        const newTags: Tag[] = []
        for (const name of aiTags) {
          if (existing.has(name)) continue
          existing.add(name)
          const found = tags.find((t) => t.name === name)
          if (found) {
            newTags.push(found)
          } else {
            newTags.push({ id: crypto.randomUUID(), name })
          }
        }
        return [...prev, ...newTags]
      })
      appendLog(`已填充：${result.title}，${result.tags.length} 个标签`)
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      appendLog(`识别失败：${message}`)
      setError(message)
    } finally {
      setAnalyzing(false)
    }
  }

  function handleClose(isOpen: boolean) {
    if (saving || analyzing) return
    if (!isOpen) resetForm()
    onOpenChange(isOpen)
  }

  async function handleAlbumCreated(newAlbumId: string) {
    setAlbumId(newAlbumId)
    try {
      const refreshed = await getAllAlbums()
      setLocalAlbums(refreshed)
    } catch {
      // best-effort
    }
  }

  async function handlePickAfter() {
    const path = await pickImageFile()
    if (path) {
      setAfterPath(path)
      setAfterExisting(null)
    }
  }

  async function handlePickBefore() {
    const path = await pickImageFile()
    if (path) {
      setBeforePath(path)
      setBeforeExisting(null)
    }
  }

  function handleRemoveBefore() {
    setBeforePath(null)
    setBeforeExisting(null)
  }

  function handleRemoveAfter() {
    setAfterPath(null)
    setAfterExisting(null)
  }

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    setError(null)

    try {
      const tagIds: string[] = []
      for (const tag of selectedTags) {
        const t = await getOrCreateTag({ id: tag.id, name: tag.name, color: tag.color })
        tagIds.push(t.id)
      }

      if (mode === "create") {
        await handleCreate(tagIds)
      } else {
        await handleEdit(tagIds)
      }

      resetForm()
      onOpenChange(false)
      onSaved()
    } catch (e) {
      console.error(`${mode} failed:`, e)
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  async function handleCreate(tagIds: string[]) {
    const figureId = crypto.randomUUID()
    const result = await importFigureImages(
      figureId,
      afterPath!,
      beforePath ?? undefined,
    )

    try {
      const images: { id: string; imagePath: string; imageRole: string; sortOrder: number }[] = [
        { id: crypto.randomUUID(), imagePath: result.afterPath, imageRole: "after", sortOrder: 0 },
      ]
      if (result.beforePath) {
        images.push({
          id: crypto.randomUUID(),
          imagePath: result.beforePath,
          imageRole: "before",
          sortOrder: 1,
        })
      }

      await createFigure({
        id: figureId,
        title: title.trim(),
        description: description.trim() || undefined,
        albumId: albumId || undefined,
        isFavorite,
        images,
        tagIds,
      })
    } catch (dbError) {
      await cleanupFigureImages(figureId)
      throw dbError
    }
  }

  async function handleEdit(tagIds: string[]) {
    if (!figure) return

    const oldAfterImg = getAfterImage(figure)
    const oldBeforeImg = getBeforeImage(figure)
    const newCopiedPaths: string[] = []

    try {
      // Build updated images array
      const images: { id: string; imagePath: string; imageRole: string; sortOrder: number }[] = []

      // After image
      if (afterPath) {
        const newId = crypto.randomUUID()
        const newRelPath = await copySingleImage(figure.id, "after", afterPath, newId)
        newCopiedPaths.push(newRelPath)
        images.push({ id: newId, imagePath: newRelPath, imageRole: "after", sortOrder: 0 })
      } else if (afterExisting && oldAfterImg) {
        images.push({
          id: oldAfterImg.id,
          imagePath: oldAfterImg.imagePath,
          imageRole: "after",
          sortOrder: 0,
        })
      }

      // Before image
      if (beforePath) {
        const newId = crypto.randomUUID()
        const newRelPath = await copySingleImage(figure.id, "before", beforePath, newId)
        newCopiedPaths.push(newRelPath)
        images.push({ id: newId, imagePath: newRelPath, imageRole: "before", sortOrder: 1 })
      } else if (beforeExisting && oldBeforeImg) {
        images.push({
          id: oldBeforeImg.id,
          imagePath: oldBeforeImg.imagePath,
          imageRole: "before",
          sortOrder: 1,
        })
      }

      await updateFigure({
        id: figure.id,
        title: title.trim(),
        description: description.trim() || undefined,
        albumId: albumId || undefined,
        isFavorite,
        tagIds,
        images,
      })

      // DB succeeded — clean up old replaced/removed images
      const pathsToClean: string[] = []
      if (afterPath && oldAfterImg) {
        pathsToClean.push(oldAfterImg.imagePath)
      }
      if (beforePath && oldBeforeImg) {
        pathsToClean.push(oldBeforeImg.imagePath)
      }
      if (!hasBefore && oldBeforeImg) {
        pathsToClean.push(oldBeforeImg.imagePath)
      }

      for (const p of pathsToClean) {
        try {
          await deleteAppImage(p)
        } catch (e) {
          console.warn("Failed to clean old image:", p, e)
        }
      }
    } catch (e) {
      // DB or copy failed — clean up newly copied images
      for (const p of newCopiedPaths) {
        try {
          await deleteAppImage(p)
        } catch {
          // best-effort
        }
      }
      throw e
    }
  }

  function previewSrc(filePath: string): string {
    return convertFileSrc(filePath)
  }

  const dialogTitle = mode === "create" ? "导入收藏项" : "编辑收藏项"
  const saveLabel = mode === "create"
    ? saving ? "导入中…" : "保存"
    : saving ? "保存中…" : "保存"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* After 图片 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              AI 图片 <span className="text-destructive">*</span>
            </label>
            <div
              className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary/50 hover:bg-muted overflow-hidden"
              onClick={handlePickAfter}
            >
              {afterPath ? (
                <div className="relative size-full">
                  <img
                    src={previewSrc(afterPath)}
                    alt="After 预览"
                    className="size-full object-contain"
                  />
                  <button
                    type="button"
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                    onClick={(e) => { e.stopPropagation(); handleRemoveAfter() }}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : afterExisting ? (
                <div className="relative size-full">
                  <ExistingImagePreview relativePath={afterExisting} alt="After 当前" />
                  <button
                    type="button"
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                    onClick={(e) => { e.stopPropagation(); handleRemoveAfter() }}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <ImagePlus className="size-8" />
                  <span className="text-xs">点击选择 AI 图片</span>
                </div>
              )}
            </div>
          </div>

          {/* AI 识别 */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            disabled={!afterAnalyzePath || analyzing || saving}
            onClick={handleAiAnalyze}
          >
            {analyzing ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Sparkles className="mr-1.5 size-4" />
            )}
            {analyzing ? "AI 识别中…" : "AI 识别填充"}
          </Button>

          {analysisLogs.length > 0 && (
            <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <div className="mb-1 font-medium text-foreground/80">识别日志</div>
              <div className="space-y-1">
                {analysisLogs.map((log, index) => (
                  <div key={`${index}-${log}`} className="flex gap-2">
                    <span className="mt-[0.15rem] size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Before 图片 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">原始图片（可选）</label>
            <div
              className="flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary/50 hover:bg-muted overflow-hidden"
              onClick={handlePickBefore}
            >
              {beforePath ? (
                <div className="relative size-full">
                  <img
                    src={previewSrc(beforePath)}
                    alt="Before 预览"
                    className="size-full object-contain"
                  />
                  <button
                    type="button"
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                    onClick={(e) => { e.stopPropagation(); handleRemoveBefore() }}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : beforeExisting ? (
                <div className="relative size-full">
                  <ExistingImagePreview relativePath={beforeExisting} alt="Before 当前" />
                  <button
                    type="button"
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                    onClick={(e) => { e.stopPropagation(); handleRemoveBefore() }}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <ImagePlus className="size-6" />
                  <span className="text-xs">点击选择 Before 图片</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* 标题 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              标题 <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="给收藏项起个名字"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 描述 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">描述</label>
            <Textarea
              placeholder="添加描述（可选）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* 相册 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">相册</label>
            <div className="flex gap-1.5">
              <Select value={albumId} onValueChange={(v) => setAlbumId(v ?? "")}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="选择相册（可选）" />
                </SelectTrigger>
                <SelectContent>
                  {localAlbums.map((album) => (
                    <SelectItem key={album.id} value={album.id}>
                      {album.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 shrink-0"
                onClick={() => setIsAlbumFormOpen(true)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          {/* 标签 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">标签</label>
            <TagInput
              allTags={tags}
              selectedTags={selectedTags}
              onChange={setSelectedTags}
            />
          </div>

          {/* 星标 */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={isFavorite ? "default" : "outline"}
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              {isFavorite ? "★ 已星标" : "☆ 添加星标"}
            </Button>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={saving}>
            取消
          </Button>
          <Button disabled={!canSave} onClick={handleSave}>
            {saving && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            {saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>

      <AlbumFormDialog
        open={isAlbumFormOpen}
        onOpenChange={setIsAlbumFormOpen}
        onCreated={handleAlbumCreated}
      />
    </Dialog>
  )
}
