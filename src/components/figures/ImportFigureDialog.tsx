import { useState } from "react"
import { ImagePlus, X } from "lucide-react"
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

interface ImportFigureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  albums: Album[]
  tags: Tag[]
}

export function ImportFigureDialog({
  open,
  onOpenChange,
  albums,
  tags,
}: ImportFigureDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [albumId, setAlbumId] = useState<string>("")
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [isFavorite, setIsFavorite] = useState(false)

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      setTitle("")
      setDescription("")
      setAlbumId("")
      setSelectedTags([])
      setIsFavorite(false)
    }
    onOpenChange(isOpen)
  }

  function toggleTag(tag: Tag) {
    setSelectedTags((prev) =>
      prev.some((t) => t.id === tag.id)
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, tag]
    )
  }

  const canSave = title.trim().length > 0

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
            <div className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary/50 hover:bg-muted">
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <ImagePlus className="size-8" />
                <span className="text-xs">点击选择 After 图片</span>
              </div>
            </div>
          </div>

          {/* Before 图片 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">原始图片（可选）</label>
            <div className="flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary/50 hover:bg-muted">
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <ImagePlus className="size-6" />
                <span className="text-xs">点击选择 Before 图片</span>
              </div>
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
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => handleClose(false)}>
            取消
          </Button>
          <Button disabled={!canSave} onClick={() => handleClose(false)}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
