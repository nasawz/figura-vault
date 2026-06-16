import { useState, useMemo, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { AppLayout } from "@/components/layout/AppLayout"
import { GalleryPage } from "@/pages/GalleryPage"
import { FigureDetailPage } from "@/pages/FigureDetailPage"
import { SettingsPage } from "@/pages/SettingsPage"
import { ImportFigureDialog } from "@/components/figures/ImportFigureDialog"
import { FigureFormDialog } from "@/components/figures/FigureFormDialog"
import { Toaster } from "@/components/ui/sonner"
import type { ViewMode, SortMode } from "@/pages/GalleryPage"
import type { FigureItem, Album, Tag } from "@/types/figure"
import { getAllFigures, toggleFavorite as dbToggleFavorite, deleteFigure } from "@/lib/figure"
import { cleanupFigureImages } from "@/lib/file"
import { getAllAlbums } from "@/lib/album"
import { getAllTags } from "@/lib/tag"

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
  const [sortMode, setSortMode] = useState<SortMode>("newest")
  const [activeFigureId, setActiveFigureId] = useState<string | null>(null)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
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
      toast.success(newState ? "已添加星标" : "已取消星标")
    } catch (e) {
      console.error("Failed to toggle favorite:", e)
      toast.error("操作失败", { description: e instanceof Error ? e.message : String(e) })
    }
  }, [])

  const handleDeleteFigure = useCallback(async (figureId: string) => {
    await deleteFigure(figureId)

    try {
      await cleanupFigureImages(figureId)
    } catch (e) {
      console.error("Failed to cleanup images:", e)
      toast.warning("图片文件清理失败", {
        description: "数据库记录已删除，但图片目录可能残留，请手动清理。",
      })
    }

    setActiveFigureId(null)
    setFigures((prev) => prev.filter((f) => f.id !== figureId))
    toast.success("收藏项已删除")
  }, [])

  const handleEditSaved = useCallback(async () => {
    toast.success("收藏项已更新")
    try {
      const [figuresData, albumsData, tagsData] = await Promise.all([
        getAllFigures(),
        getAllAlbums(),
        getAllTags(),
      ])
      setFigures(figuresData)
      setAlbums(albumsData)
      setTags(tagsData)
    } catch (e) {
      console.error("Failed to reload data after edit:", e)
    }
  }, [])

  const activeFigure = useMemo(
    () => (activeFigureId ? figures.find((f) => f.id === activeFigureId) : null) ?? null,
    [activeFigureId, figures],
  )

  const hasActiveFilters = viewMode === "favorites" || !!selectedAlbumId || !!selectedTagId || !!searchQuery.trim()

  const clearFilters = useCallback(() => {
    setViewMode("all")
    setSelectedAlbumId(null)
    setSelectedTagId(null)
    setSearchQuery("")
    setSortMode("newest")
  }, [])

  const activeFilterSummary = useMemo(() => {
    const parts: string[] = []
    if (viewMode === "favorites") parts.push("星标")
    if (selectedAlbumId) {
      const album = albums.find((a) => a.id === selectedAlbumId)
      if (album) parts.push(`相册「${album.name}」`)
    }
    if (selectedTagId) {
      const tag = tags.find((t) => t.id === selectedTagId)
      if (tag) parts.push(`标签「${tag.name}」`)
    }
    if (searchQuery.trim()) parts.push(`搜索「${searchQuery.trim()}」`)
    return parts.length > 0 ? parts.join(" + ") : null
  }, [viewMode, selectedAlbumId, selectedTagId, searchQuery, albums, tags])

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
    <>
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
        onSettingsClick={() => {
          setShowSettings(true)
          setActiveFigureId(null)
        }}
      >
        {showSettings ? (
          <SettingsPage onBack={() => setShowSettings(false)} />
        ) : activeFigure ? (
          <FigureDetailPage
            figure={activeFigure}
            onBack={() => setActiveFigureId(null)}
            onToggleFavorite={toggleFavorite}
            onDeleteFigure={handleDeleteFigure}
            onEditClick={() => setIsEditOpen(true)}
          />
        ) : (
          <GalleryPage
            figures={figures}
            searchQuery={searchQuery}
            viewMode={viewMode}
            selectedAlbumId={selectedAlbumId}
            selectedTagId={selectedTagId}
            sortMode={sortMode}
            onSortModeChange={setSortMode}
            activeFilterSummary={activeFilterSummary}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            onSearchChange={setSearchQuery}
            onOpenFigure={(f) => {
              setActiveFigureId(f.id)
              setShowSettings(false)
            }}
            onImportClick={() => setIsImportOpen(true)}
          />
        )}

        <ImportFigureDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
          albums={albums}
          tags={tags}
          onImported={() => {
            toast.success("收藏项已导入")
            loadData()
          }}
        />

        {activeFigure && (
          <FigureFormDialog
            mode="edit"
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            albums={albums}
            tags={tags}
            onSaved={handleEditSaved}
            figure={activeFigure}
          />
        )}
      </AppLayout>
      <Toaster />
    </>
  )
}

export default App
