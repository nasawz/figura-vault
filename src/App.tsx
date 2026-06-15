import { useState, useMemo, useCallback } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { GalleryPage } from "@/pages/GalleryPage"
import { FigureDetailDialog } from "@/components/figures/FigureDetailDialog"
import { ImportFigureDialog } from "@/components/figures/ImportFigureDialog"
import type { ViewMode } from "@/pages/GalleryPage"
import type { FigureItem } from "@/types/figure"
import { mockAlbums, mockTags, mockFigures } from "@/data/mockFigures"

function App() {
  const [figures, setFigures] = useState<FigureItem[]>(mockFigures)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("all")
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null)
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const [selectedFigure, setSelectedFigure] = useState<FigureItem | null>(null)
  const [isImportOpen, setIsImportOpen] = useState(false)

  const toggleFavorite = useCallback((figureId: string) => {
    setFigures((prev) =>
      prev.map((f) =>
        f.id === figureId ? { ...f, isFavorite: !f.isFavorite } : f
      )
    )
  }, [])

  const topBarTitle = useMemo(() => {
    if (viewMode === "favorites") return "星标收藏"
    if (selectedAlbumId) {
      const album = mockAlbums.find((a) => a.id === selectedAlbumId)
      return album?.name ?? "相册"
    }
    if (selectedTagId) {
      const tag = mockTags.find((t) => t.id === selectedTagId)
      return tag ? `#${tag.name}` : "标签"
    }
    return "全部收藏"
  }, [viewMode, selectedAlbumId, selectedTagId])

  return (
    <AppLayout
      figures={figures}
      albums={mockAlbums}
      tags={mockTags}
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
        albums={mockAlbums}
        tags={mockTags}
      />
    </AppLayout>
  )
}

export default App
