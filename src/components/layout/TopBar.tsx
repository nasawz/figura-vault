import { Plus, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TopBar() {
  return (
    <header className="flex shrink-0 flex-col border-b">
      {/* macOS titlebar drag region */}
      <div data-tauri-drag-region className="h-[38px] shrink-0" />
      <div className="flex h-10 items-center gap-2 px-4 pb-2">
        <h1 className="text-lg font-semibold">全部收藏</h1>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="size-8">
            <LayoutGrid className="size-4" />
          </Button>
          <Button size="sm">
            <Plus className="size-4" />
            导入图片
          </Button>
        </div>
      </div>
    </header>
  )
}
