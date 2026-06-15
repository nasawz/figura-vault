import { Images } from "lucide-react"
import type { FigureItem } from "@/types/figure"
import { FigureCard } from "./FigureCard"

interface FigureGridProps {
  figures: FigureItem[]
  onOpenFigure: (figure: FigureItem) => void
  onToggleFavorite: (figureId: string) => void
}

export function FigureGrid({ figures, onOpenFigure, onToggleFavorite }: FigureGridProps) {
  if (figures.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
          <Images className="size-7 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">没有找到匹配的收藏项</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {figures.map((figure) => (
        <FigureCard
          key={figure.id}
          figure={figure}
          onClick={() => onOpenFigure(figure)}
          onToggleFavorite={() => onToggleFavorite(figure.id)}
        />
      ))}
    </div>
  )
}
