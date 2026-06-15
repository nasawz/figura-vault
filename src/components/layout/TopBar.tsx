import { Plus, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { startWindowDrag } from "@/lib/window-drag"

export function TopBar() {
  const { state } = useSidebar()

  return (
    <header
      className="flex h-8 shrink-0 items-center border-b bg-background"
      onMouseDown={startWindowDrag}
    >
      <div
        className={cn(
          "flex h-full w-full items-center gap-2 pr-3 transition-[padding] duration-200 ease-linear",
          state === "collapsed" ? "pl-[116px]" : "pl-4"
        )}
      >
        <h1 className="flex h-full items-center text-sm font-medium tracking-normal text-foreground/85">
          全部收藏
        </h1>

        <div className="min-w-3 flex-1 self-stretch" />

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-6 rounded-md text-muted-foreground hover:text-foreground [&_svg]:size-3.5"
          >
            <LayoutGrid />
          </Button>
          <Button size="icon" className="size-6 rounded-md">
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
