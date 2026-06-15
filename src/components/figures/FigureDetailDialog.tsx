import { useState } from "react"
import { Star, Trash2, Layers, SlidersHorizontal, Eraser, Image, ImageOff, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { FigureItem } from "@/types/figure"
import { getAfterImage, getBeforeImage, hasBeforeAfter } from "@/types/figure"
import { useImageSrc } from "@/hooks/use-image-src"

interface FigureDetailDialogProps {
  figure: FigureItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggleFavorite: (figureId: string) => void
  onDeleteFigure: (figureId: string) => Promise<void>
}

function ImagePlaceholder({ label }: { label?: string }) {
  return (
    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-lg border bg-muted/30">
      <ImageOff className="size-8 text-muted-foreground/50" />
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
    </div>
  )
}

function LoadableImage({
  src,
  alt,
  contain,
}: {
  src: string | undefined
  alt: string
  contain?: boolean
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (!src) return <ImagePlaceholder label="无图片" />
  if (error) return <ImagePlaceholder label="图片加载失败" />

  return (
    <div className="relative w-full">
      {!loaded && (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border bg-muted/30">
          <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full ${contain ? "object-contain" : "object-cover aspect-[4/3]"} ${loaded ? "" : "sr-only"}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  )
}

export function FigureDetailDialog({
  figure,
  open,
  onOpenChange,
  onToggleFavorite,
  onDeleteFigure,
}: FigureDetailDialogProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const afterImage = figure ? getAfterImage(figure) : undefined
  const beforeImage = figure ? getBeforeImage(figure) : undefined
  const hasBa = figure ? hasBeforeAfter(figure) : false

  const afterSrc = useImageSrc(afterImage?.imagePath)
  const beforeSrc = useImageSrc(beforeImage?.imagePath)

  if (!figure) return null

  async function handleDelete() {
    if (!figure) return
    setDeleting(true)
    try {
      await onDeleteFigure(figure.id)
      setDeleteConfirmOpen(false)
    } catch {
      setDeleting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {figure.title}
              {hasBa && (
                <Badge variant="outline" className="gap-1 text-xs font-normal">
                  <Layers className="size-3" />
                  Before / After
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {hasBa ? (
            <Tabs defaultValue="slider" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="slider" className="gap-1">
                  <SlidersHorizontal className="size-3.5" />
                  滑杆对比
                </TabsTrigger>
                <TabsTrigger value="eraser" className="gap-1">
                  <Eraser className="size-3.5" />
                  橡皮擦对比
                </TabsTrigger>
                <TabsTrigger value="before" className="gap-1">
                  <Image className="size-3.5" />
                  原图
                </TabsTrigger>
                <TabsTrigger value="after" className="gap-1">
                  <Image className="size-3.5" />
                  AI 图
                </TabsTrigger>
              </TabsList>

              <TabsContent value="slider" className="mt-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <div className="overflow-hidden rounded-lg border">
                      <LoadableImage src={beforeSrc} alt="Before" />
                      <p className="py-1 text-center text-xs text-muted-foreground">Before</p>
                    </div>
                    <div className="overflow-hidden rounded-lg border">
                      <LoadableImage src={afterSrc} alt="After" />
                      <p className="py-1 text-center text-xs text-muted-foreground">After</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">滑杆对比组件将在 Phase 6 实现</p>
                </div>
              </TabsContent>

              <TabsContent value="eraser" className="mt-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="overflow-hidden rounded-lg border">
                    <LoadableImage src={afterSrc} alt="After" />
                  </div>
                  <p className="text-xs text-muted-foreground">橡皮擦对比组件将在 Phase 7 实现</p>
                </div>
              </TabsContent>

              <TabsContent value="before" className="mt-4">
                <div className="overflow-hidden rounded-lg">
                  <LoadableImage src={beforeSrc} alt="原图" contain />
                </div>
              </TabsContent>

              <TabsContent value="after" className="mt-4">
                <div className="overflow-hidden rounded-lg">
                  <LoadableImage src={afterSrc} alt="AI 图" contain />
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="overflow-hidden rounded-lg">
              <LoadableImage src={afterSrc} alt={figure.title} contain />
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            {figure.description && (
              <p className="text-sm text-muted-foreground">{figure.description}</p>
            )}

            {figure.album && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">相册：</span>
                <Badge variant="secondary">{figure.album.name}</Badge>
              </div>
            )}

            {figure.tags.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="shrink-0 text-muted-foreground">标签：</span>
                <div className="flex flex-wrap gap-1">
                  {figure.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={() => onToggleFavorite(figure.id)}
              >
                <Star
                  className={`size-4 ${figure.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`}
                />
                {figure.isFavorite ? "已收藏" : "收藏"}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-destructive hover:text-destructive"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <Trash2 className="size-4" />
              删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除这个收藏项吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将删除数据库记录和应用内保存的图片副本，无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  删除中…
                </>
              ) : (
                "确认删除"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
