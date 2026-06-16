import { useState } from "react"
import { ImageOff } from "lucide-react"
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
  const [imgError, setImgError] = useState(false)

  return (
    <button
      type="button"
      className="group block overflow-hidden bg-white text-left transition-transform duration-300 hover:-translate-y-0.5"
      onClick={onClick}
    >
      <div className="aspect-[9/16] overflow-hidden bg-white">
        {src && !imgError ? (
          <img
            src={src}
            alt={figure.title}
            className="size-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1.5 bg-muted/30 text-muted-foreground">
            <ImageOff className="size-6 opacity-40" />
            <span className="text-xs">{src ? "加载失败" : "无图片"}</span>
          </div>
        )}
      </div>
    </button>
  )
}
