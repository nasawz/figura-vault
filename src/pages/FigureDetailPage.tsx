import { useState } from "react"
import {
  ArrowLeft,
  Star,
  Trash2,
  Layers,
  ImageOff,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { FigureComparePanel } from "@/components/figures/FigureComparePanel"

interface FigureDetailPageProps {
  figure: FigureItem
  onBack: () => void
  onToggleFavorite: (figureId: string) => void
  onDeleteFigure: (figureId: string) => Promise<void>
}

function SingleImagePreview({
  src,
  alt,
}: {
  src: string | undefined
  alt: string
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (!src) {
    return (
      <div className="flex aspect-[9/16] w-full flex-col items-center justify-center gap-2 rounded-lg border bg-muted/30">
        <ImageOff className="size-8 text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground">无图片</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex aspect-[9/16] w-full flex-col items-center justify-center gap-2 rounded-lg border bg-muted/30">
        <ImageOff className="size-8 text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground">图片加载失败</p>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {!loaded && (
        <div className="flex aspect-[9/16] w-full items-center justify-center rounded-lg border bg-muted/30">
          <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`aspect-[9/16] w-full rounded-lg border object-contain ${loaded ? "" : "sr-only"}`}
        style={{
          background:
            "repeating-conic-gradient(hsl(var(--muted)) 0% 25%, hsl(var(--background)) 0% 50%) 50% / 16px 16px",
        }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  )
}

export function FigureDetailPage({
  figure,
  onBack,
  onToggleFavorite,
  onDeleteFigure,
}: FigureDetailPageProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const afterImage = getAfterImage(figure)
  const beforeImage = getBeforeImage(figure)
  const hasBa = hasBeforeAfter(figure)

  const afterSrc = useImageSrc(afterImage?.imagePath)
  const beforeSrc = useImageSrc(beforeImage?.imagePath)

  async function handleDelete() {
    setDeleting(true)
    try {
      await onDeleteFigure(figure.id)
    } catch {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Main stage — 9:16 image workspace */}
        <div className="content-scrollbar flex min-h-0 flex-1 items-start justify-center overflow-auto p-4 lg:p-6">
          <div className="w-full max-w-md">
            {hasBa ? (
              <FigureComparePanel
                beforeSrc={beforeSrc}
                afterSrc={afterSrc}
                title={figure.title}
              />
            ) : (
              <SingleImagePreview src={afterSrc} alt={figure.title} />
            )}
          </div>
        </div>

        {/* Right sidebar — metadata & actions */}
        <aside className="flex w-full shrink-0 flex-col border-t bg-background lg:w-64 lg:border-t-0 lg:border-l xl:w-72">
          <div className="content-scrollbar flex-1 space-y-4 overflow-auto p-4">
            {/* Back button */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={onBack}
            >
              <ArrowLeft className="size-4" />
              返回收藏墙
            </Button>

            <Separator />

            {/* Title */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold leading-snug">{figure.title}</h2>
              {hasBa && (
                <Badge variant="outline" className="gap-1 text-xs font-normal">
                  <Layers className="size-3" />
                  Before / After
                </Badge>
              )}
            </div>

            {/* Description */}
            {figure.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {figure.description}
              </p>
            )}

            {/* Album */}
            {figure.album && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">相册</span>
                <div>
                  <Badge variant="secondary">{figure.album.name}</Badge>
                </div>
              </div>
            )}

            {/* Tags */}
            {figure.tags.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">标签</span>
                <div className="flex flex-wrap gap-1">
                  {figure.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => onToggleFavorite(figure.id)}
              >
                <Star
                  className={`size-4 ${figure.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`}
                />
                {figure.isFavorite ? "取消收藏" : "收藏"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 className="size-4" />
                删除
              </Button>
            </div>
          </div>
        </aside>
      </div>

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
