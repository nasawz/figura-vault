import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "./AppSidebar"
import { TopBar } from "./TopBar"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger className="fixed left-[80px] top-1 z-50 size-6 shrink-0 rounded-md bg-sidebar text-sidebar-foreground/65 shadow-xs hover:bg-sidebar-accent hover:text-sidebar-foreground [&_svg]:size-3.5" />
        <SidebarInset className="overflow-hidden">
          <TopBar />
          <div className="flex flex-1 flex-col overflow-auto">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
