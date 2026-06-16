import { useMemo, useState, useEffect } from "react"
import { Images, Search, X, FilterX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FigureGrid } from "@/components/figures/FigureGrid"
import type { FigureItem } from "@/types/figure"

export type ViewMode = "all" | "favorites"
export type SortMode = "newest" | "oldest" | "titleAsc" | "titleDesc"

interface GalleryPageProps {
  figures: FigureItem[]
  searchQuery: string
  viewMode: ViewMode
  selectedAlbumId: string | null
  selectedTagId: string | null
  sortMode: SortMode
  onSortModeChange: (mode: SortMode) => void
  activeFilterSummary: string | null
  hasActiveFilters: boolean
  onClearFilters: () => void
  onSearchChange: (query: string) => void
  onOpenFigure: (figure: FigureItem) => void
  onImportClick: () => void
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

const SORT_LABELS: Record<SortMode, string> = {
  newest: "最近导入",
  oldest: "最早导入",
  titleAsc: "标题 A-Z",
  titleDesc: "标题 Z-A",
}

function sortFigures(figures: FigureItem[], mode: SortMode): FigureItem[] {
  const sorted = [...figures]
  switch (mode) {
    case "newest":
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      break
    case "oldest":
      sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      break
    case "titleAsc":
      sorted.sort((a, b) => a.title.localeCompare(b.title, "zh"))
      break
    case "titleDesc":
      sorted.sort((a, b) => b.title.localeCompare(a.title, "zh"))
      break
  }
  return sorted
}

export function GalleryPage({
  figures,
  searchQuery,
  viewMode,
  selectedAlbumId,
  selectedTagId,
  sortMode,
  onSortModeChange,
  activeFilterSummary,
  hasActiveFilters,
  onClearFilters,
  onSearchChange,
  onOpenFigure,
  onImportClick,
}: GalleryPageProps) {
  const debouncedQuery = useDebounce(searchQuery, 300)

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

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.trim().toLowerCase()
      result = result.filter((f) => f.title.toLowerCase().includes(q))
    }

    return sortFigures(result, sortMode)
  }, [figures, viewMode, selectedAlbumId, selectedTagId, debouncedQuery, sortMode])

  // Global empty — no figures at all
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
      {/* Toolbar */}
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

        <Select value={sortMode} onValueChange={(v) => onSortModeChange(v as SortMode)}>
          <SelectTrigger className="h-8 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORT_LABELS) as SortMode[]).map((key) => (
              <SelectItem key={key} value={key}>
                {SORT_LABELS[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-muted-foreground"
            onClick={onClearFilters}
          >
            <FilterX className="size-3.5" />
            清空筛选
          </Button>
        )}
      </div>

      {/* Active filter summary */}
      {activeFilterSummary && (
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-1.5">
          <span className="text-xs text-muted-foreground">当前筛选：</span>
          <Badge variant="secondary" className="text-xs font-normal">
            {activeFilterSummary}
          </Badge>
        </div>
      )}

      {/* Content */}
      <div className="content-scrollbar flex-1 overflow-auto">
        {filteredFigures.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <Images className="size-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">未找到匹配的收藏项</p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={onClearFilters}
              >
                <FilterX className="size-3.5" />
                清空筛选
              </Button>
            )}
          </div>
        ) : (
          <FigureGrid
            figures={filteredFigures}
            onOpenFigure={onOpenFigure}
          />
        )}
      </div>
    </div>
  )
}
