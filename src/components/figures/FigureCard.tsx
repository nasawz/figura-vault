import { Star, Layers } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { FigureItem } from "@/types/figure"
import { getAfterImage, hasBeforeAfter } from "@/types/figure"

interface FigureCardProps {
  figure: FigureItem
  onClick: () => void
  onToggleFavorite: () => void
}

export function FigureCard({ figure, onClick, onToggleFavorite }: FigureCardProps) {
  const afterImage = getAfterImage(figure)
  const hasBa = hasBeforeAfter(figure)

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {afterImage ? (
          <img
            src={afterImage.imagePath}
            alt={figure.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            无图片
          </div>
        )}

        {hasBa && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
            <Layers className="size-3" />
            B/A
          </div>
        )}

        <button
          className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
        >
          <Star
            className={`size-4 ${figure.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`}
          />
        </button>
      </div>

      <div className="space-y-1.5 p-3">
        <h3 className="truncate text-sm font-medium">{figure.title}</h3>
        {figure.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {figure.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-[10px] px-1.5 py-0">
                {tag.name}
              </Badge>
            ))}
            {figure.tags.length > 3 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                +{figure.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
