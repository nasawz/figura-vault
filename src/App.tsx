import { useState, useMemo, useCallback, useEffect } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { GalleryPage } from "@/pages/GalleryPage"
import { FigureDetailDialog } from "@/components/figures/FigureDetailDialog"
import { ImportFigureDialog } from "@/components/figures/ImportFigureDialog"
import type { ViewMode } from "@/pages/GalleryPage"
import type { FigureItem, Album, Tag } from "@/types/figure"
import { getAllFigures, toggleFavorite as dbToggleFavorite } from "@/lib/figure"
import { getAllAlbums } from "@/lib/album"
import { getAllTags } from "@/lib/tag"
import { seedIfEmpty } from "@/lib/seed"

function App() {
  const [figures, setFigures] = useState<FigureItem[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("all")
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null)
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const [selectedFigure, setSelectedFigure] = useState<FigureItem | null>(null)
  const [isImportOpen, setIsImportOpen] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      await seedIfEmpty()
      const [figuresData, albumsData, tagsData] = await Promise.all([
        getAllFigures(),
        getAllAlbums(),
        getAllTags(),
      ])
      setFigures(figuresData)
      setAlbums(albumsData)
      setTags(tagsData)
    } catch (e) {
      console.error("Failed to load data:", e)
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleFavorite = useCallback(async (figureId: string) => {
    try {
      const newState = await dbToggleFavorite(figureId)
      setFigures((prev) =>
        prev.map((f) =>
          f.id === figureId ? { ...f, isFavorite: newState } : f
        )
      )
    } catch (e) {
      console.error("Failed to toggle favorite:", e)
    }
  }, [])

  const topBarTitle = useMemo(() => {
    if (viewMode === "favorites") return "星标收藏"
    if (selectedAlbumId) {
      const album = albums.find((a) => a.id === selectedAlbumId)
      return album?.name ?? "相册"
    }
    if (selectedTagId) {
      const tag = tags.find((t) => t.id === selectedTagId)
      return tag ? `#${tag.name}` : "标签"
    }
    return "全部收藏"
  }, [viewMode, selectedAlbumId, selectedTagId, albums, tags])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground/25 border-t-foreground" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-destructive">加载数据失败</p>
          <p className="max-w-sm text-xs text-muted-foreground">{error}</p>
          <button
            className="mt-2 rounded-md bg-primary px-4 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
            onClick={loadData}
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <AppLayout
      figures={figures}
      albums={albums}
      tags={tags}
      viewMode={viewMode}
      selectedAlbumId={selectedAlbumId}
      selectedTagId={selectedTagId}
      topBarTitle={topBarTitle}
      onViewModeChange={setViewMode}
      onAlbumSelect={setSelectedAlbumId}
      onTagSelect={setSelectedTagId}
      onImportClick={() => setIsImportOpen(true)}
    >
      <GalleryPage
        figures={figures}
        searchQuery={searchQuery}
        viewMode={viewMode}
        selectedAlbumId={selectedAlbumId}
        selectedTagId={selectedTagId}
        onSearchChange={setSearchQuery}
        onOpenFigure={setSelectedFigure}
        onImportClick={() => setIsImportOpen(true)}
      />

      <FigureDetailDialog
        figure={selectedFigure ? figures.find((f) => f.id === selectedFigure.id) ?? selectedFigure : null}
        open={selectedFigure !== null}
        onOpenChange={(open) => { if (!open) setSelectedFigure(null) }}
        onToggleFavorite={toggleFavorite}
      />

      <ImportFigureDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        albums={albums}
        tags={tags}
        onImported={loadData}
      />
    </AppLayout>
  )
}

export default App
