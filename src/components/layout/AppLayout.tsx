import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "./AppSidebar"
import { TopBar } from "./TopBar"
import type { Album, Tag, FigureItem } from "@/types/figure"
import type { ViewMode } from "@/pages/GalleryPage"

interface AppLayoutProps {
  children: React.ReactNode
  figures: FigureItem[]
  albums: Album[]
  tags: Tag[]
  viewMode: ViewMode
  selectedAlbumId: string | null
  selectedTagId: string | null
  topBarTitle: string
  onViewModeChange: (mode: ViewMode) => void
  onAlbumSelect: (albumId: string | null) => void
  onTagSelect: (tagId: string | null) => void
  onImportClick: () => void
}

export function AppLayout({
  children,
  figures,
  albums,
  tags,
  viewMode,
  selectedAlbumId,
  selectedTagId,
  topBarTitle,
  onViewModeChange,
  onAlbumSelect,
  onTagSelect,
  onImportClick,
}: AppLayoutProps) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          figures={figures}
          albums={albums}
          tags={tags}
          viewMode={viewMode}
          selectedAlbumId={selectedAlbumId}
          selectedTagId={selectedTagId}
          onViewModeChange={onViewModeChange}
          onAlbumSelect={onAlbumSelect}
          onTagSelect={onTagSelect}
        />
        <SidebarTrigger className="fixed left-[80px] top-1 z-50 size-6 shrink-0 rounded-md bg-sidebar text-sidebar-foreground/65 shadow-xs hover:bg-sidebar-accent hover:text-sidebar-foreground [&_svg]:size-3.5" />
        <SidebarInset className="overflow-hidden">
          <TopBar title={topBarTitle} onImportClick={onImportClick} />
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
