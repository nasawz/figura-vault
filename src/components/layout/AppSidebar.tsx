import {
  Images,
  Star,
  FolderOpen,
  Settings,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { startWindowDrag } from "@/lib/window-drag"
import type { Album, Tag, FigureItem } from "@/types/figure"
import type { ViewMode } from "@/pages/GalleryPage"

interface AppSidebarProps {
  figures: FigureItem[]
  albums: Album[]
  tags: Tag[]
  viewMode: ViewMode
  selectedAlbumId: string | null
  selectedTagId: string | null
  onViewModeChange: (mode: ViewMode) => void
  onAlbumSelect: (albumId: string | null) => void
  onTagSelect: (tagId: string | null) => void
}

export function AppSidebar({
  figures,
  albums,
  tags,
  viewMode,
  selectedAlbumId,
  selectedTagId,
  onViewModeChange,
  onAlbumSelect,
  onTagSelect,
}: AppSidebarProps) {
  const totalCount = figures.length
  const favCount = figures.filter((f) => f.isFavorite).length

  function albumCount(albumId: string) {
    return figures.filter((f) => f.albumId === albumId).length
  }

  function tagCount(tagId: string) {
    return figures.filter((f) => f.tags.some((t) => t.id === tagId)).length
  }

  const isAllActive = viewMode === "all" && !selectedAlbumId && !selectedTagId
  const isFavActive = viewMode === "favorites"

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader
        className="relative h-10 space-y-0 p-0"
        onMouseDown={startWindowDrag}
      />

      <SidebarContent className="px-2 pt-0">
        <SidebarGroup>
          <SidebarGroupLabel>收藏管理</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isAllActive}
                  onClick={() => {
                    onViewModeChange("all")
                    onAlbumSelect(null)
                    onTagSelect(null)
                  }}
                >
                  <Images className="size-4" />
                  <span>全部收藏</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>{totalCount}</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isFavActive}
                  onClick={() => {
                    onViewModeChange(viewMode === "favorites" ? "all" : "favorites")
                  }}
                >
                  <Star className="size-4" />
                  <span>星标收藏</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>{favCount}</SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>相册</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {albums.map((album) => (
                <SidebarMenuItem key={album.id}>
                  <SidebarMenuButton
                    isActive={selectedAlbumId === album.id}
                    onClick={() => {
                      onAlbumSelect(selectedAlbumId === album.id ? null : album.id)
                    }}
                  >
                    <FolderOpen className="size-4" />
                    <span>{album.name}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{albumCount(album.id)}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>标签</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tags.map((tag) => (
                <SidebarMenuItem key={tag.id}>
                  <SidebarMenuButton
                    isActive={selectedTagId === tag.id}
                    onClick={() => {
                      onTagSelect(selectedTagId === tag.id ? null : tag.id)
                    }}
                  >
                    <span
                      className={`size-2.5 shrink-0 rounded-full ${tag.color ?? "bg-gray-400"}`}
                    />
                    <span>{tag.name}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{tagCount(tag.id)}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings className="size-4" />
              <span>设置</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
