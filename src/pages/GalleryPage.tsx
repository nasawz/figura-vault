import { Images } from "lucide-react"
import { Button } from "@/components/ui/button"

export function GalleryPage() {
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
      <Button className="mt-2">导入第一张图片</Button>
    </div>
  )
}
