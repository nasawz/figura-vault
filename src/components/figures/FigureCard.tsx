import type { FigureItem } from "@/types/figure"
import { getAfterImage } from "@/types/figure"
import { useImageSrc } from "@/hooks/use-image-src"

interface FigureCardProps {
  figure: FigureItem
  onClick: () => void
}

export function FigureCard({ figure, onClick }: FigureCardProps) {
  const afterImage = getAfterImage(figure)
  const src = useImageSrc(afterImage?.imagePath)

  return (
    <button
      type="button"
      className="group block overflow-hidden bg-white text-left transition-transform duration-300 hover:-translate-y-0.5"
      onClick={onClick}
    >
      <div className="aspect-[9/16] overflow-hidden bg-white">
        {src ? (
          <img
            src={src}
            alt={figure.title}
            className="size-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            无图片
          </div>
        )}
      </div>
    </button>
  )
}
