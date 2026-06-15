import { useMemo } from "react"
import { Images, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FigureGrid } from "@/components/figures/FigureGrid"
import type { FigureItem } from "@/types/figure"

export type ViewMode = "all" | "favorites"

interface GalleryPageProps {
  figures: FigureItem[]
  searchQuery: string
  viewMode: ViewMode
  selectedAlbumId: string | null
  selectedTagId: string | null
  onSearchChange: (query: string) => void
  onOpenFigure: (figure: FigureItem) => void
  onImportClick: () => void
}

export function GalleryPage({
  figures,
  searchQuery,
  viewMode,
  selectedAlbumId,
  selectedTagId,
  onSearchChange,
  onOpenFigure,
  onImportClick,
}: GalleryPageProps) {
  const filteredFigures = useMemo(() => {
    let result = figures

    if (viewMode === "favorites") {
      result = result.filter((f) => f.isFavorite)
    }

    if (selectedAlbumId) {
      result = result.filter((f) => f.albumId === selectedAlbumId)
    }

    if (selectedTagId) {
      result = result.filter((f) => f.tags.some((t) => t.id === selectedTagId))
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter((f) => f.title.toLowerCase().includes(q))
    }

    return result
  }, [figures, viewMode, selectedAlbumId, selectedTagId, searchQuery])

  if (figures.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
          <Images className="size-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-medium">还没有收藏项</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            点击"导入图片"开始添加你的第一个 AI 手办收藏
          </p>
        </div>
        <Button className="mt-2" onClick={onImportClick}>导入第一张图片</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索收藏项..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8"
          />
          {searchQuery && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => onSearchChange("")}
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="content-scrollbar flex-1 overflow-auto">
        <FigureGrid
          figures={filteredFigures}
          onOpenFigure={onOpenFigure}
        />
      </div>
    </div>
  )
}
