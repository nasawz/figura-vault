import { useState } from "react"
import { ImagePlus, X, Loader2 } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { Album, Tag } from "@/types/figure"
import { createFigure } from "@/lib/figure"
import { getOrCreateTag } from "@/lib/tag"
import {
  pickImageFile,
  importFigureImages,
  cleanupFigureImages,
} from "@/lib/file"
import { convertFileSrc } from "@tauri-apps/api/core"

interface ImportFigureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  albums: Album[]
  tags: Tag[]
  onImported: () => void
}

export function ImportFigureDialog({
  open,
  onOpenChange,
  albums,
  tags,
  onImported,
}: ImportFigureDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [albumId, setAlbumId] = useState<string>("")
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [isFavorite, setIsFavorite] = useState(false)

  const [afterPath, setAfterPath] = useState<string | null>(null)
  const [beforePath, setBeforePath] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setTitle("")
    setDescription("")
    setAlbumId("")
    setSelectedTags([])
    setIsFavorite(false)
    setAfterPath(null)
    setBeforePath(null)
    setError(null)
    setSaving(false)
  }

  function handleClose(isOpen: boolean) {
    if (saving) return
    if (!isOpen) resetForm()
    onOpenChange(isOpen)
  }

  function toggleTag(tag: Tag) {
    setSelectedTags((prev) =>
      prev.some((t) => t.id === tag.id)
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, tag]
    )
  }

  async function handlePickAfter() {
    const path = await pickImageFile()
    if (path) setAfterPath(path)
  }

  async function handlePickBefore() {
    const path = await pickImageFile()
    if (path) setBeforePath(path)
  }

  const canSave = title.trim().length > 0 && afterPath !== null && !saving

  async function handleSave() {
    if (!canSave || !afterPath) return

    setSaving(true)
    setError(null)

    const figureId = crypto.randomUUID()

    try {
      const result = await importFigureImages(
        figureId,
        afterPath,
        beforePath ?? undefined
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

        const tagIds: string[] = []
        for (const tag of selectedTags) {
          const t = await getOrCreateTag({ id: tag.id, name: tag.name, color: tag.color })
          tagIds.push(t.id)
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

      resetForm()
      onOpenChange(false)
      onImported()
    } catch (e) {
      console.error("Import failed:", e)
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  function previewSrc(filePath: string): string {
    return convertFileSrc(filePath)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>导入收藏项</DialogTitle>
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
                    onClick={(e) => { e.stopPropagation(); setAfterPath(null) }}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <ImagePlus className="size-8" />
                  <span className="text-xs">点击选择 After 图片</span>
                </div>
              )}
            </div>
          </div>

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
                    onClick={(e) => { e.stopPropagation(); setBeforePath(null) }}
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
            <Select value={albumId} onValueChange={(v) => setAlbumId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="选择相册（可选）" />
              </SelectTrigger>
              <SelectContent>
                {albums.map((album) => (
                  <SelectItem key={album.id} value={album.id}>
                    {album.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 标签 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">标签</label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => {
                const isSelected = selectedTags.some((t) => t.id === tag.id)
                return (
                  <Badge
                    key={tag.id}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer select-none"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag.name}
                    {isSelected && <X className="ml-1 size-3" />}
                  </Badge>
                )
              })}
            </div>
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
            {saving ? "导入中…" : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
