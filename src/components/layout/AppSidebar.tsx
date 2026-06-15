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
  SidebarTrigger,
} from "@/components/ui/sidebar"

const albums = [
  { id: "1", name: "猫咪系列", count: 12 },
  { id: "2", name: "机甲系列", count: 8 },
  { id: "3", name: "桌面物品系列", count: 5 },
  { id: "4", name: "食物手办系列", count: 3 },
]

const tags = [
  { id: "1", name: "可爱", color: "bg-pink-500", count: 14 },
  { id: "2", name: "机甲", color: "bg-blue-500", count: 8 },
  { id: "3", name: "赛博朋克", color: "bg-violet-500", count: 7 },
  { id: "4", name: "动物", color: "bg-amber-500", count: 18 },
  { id: "5", name: "食物", color: "bg-green-500", count: 5 },
  { id: "6", name: "桌面物品", color: "bg-cyan-500", count: 3 },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader
        data-tauri-drag-region
        className="space-y-0 pt-[38px] pb-1 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:pt-[38px]"
      >
        <div className="flex items-center justify-end px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <SidebarTrigger className="size-7 shrink-0" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* 收藏管理 */}
        <SidebarGroup>
          <SidebarGroupLabel>收藏管理</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <Images className="size-4" />
                  <span>全部收藏</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>28</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Star className="size-4" />
                  <span>星标收藏</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>6</SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* 相册 */}
        <SidebarGroup>
          <SidebarGroupLabel>相册</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {albums.map((album) => (
                <SidebarMenuItem key={album.id}>
                  <SidebarMenuButton>
                    <FolderOpen className="size-4" />
                    <span>{album.name}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{album.count}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* 标签 */}
        <SidebarGroup>
          <SidebarGroupLabel>标签</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tags.map((tag) => (
                <SidebarMenuItem key={tag.id}>
                  <SidebarMenuButton>
                    <span
                      className={`size-2.5 shrink-0 rounded-full ${tag.color}`}
                    />
                    <span>{tag.name}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{tag.count}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
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
