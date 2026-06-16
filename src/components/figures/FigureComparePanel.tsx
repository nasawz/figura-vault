import { useState } from "react"
import { SlidersHorizontal, Eraser, Image, ImageOff, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BeforeAfterSlider } from "./BeforeAfterSlider"
import { EraserReveal } from "./EraserReveal"

interface FigureComparePanelProps {
  beforeSrc?: string
  afterSrc?: string
  title: string
}

function LoadableImage({
  src,
  alt,
}: {
  src: string | undefined
  alt: string
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (!src) {
    return (
      <div className="flex aspect-[9/16] w-full flex-col items-center justify-center gap-2 rounded-lg border bg-muted/30">
        <ImageOff className="size-8 text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground">无图片</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex aspect-[9/16] w-full flex-col items-center justify-center gap-2 rounded-lg border bg-muted/30">
        <ImageOff className="size-8 text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground">图片加载失败</p>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {!loaded && (
        <div className="flex aspect-[9/16] w-full items-center justify-center rounded-lg border bg-muted/30">
          <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`aspect-[9/16] w-full rounded-lg border object-contain ${loaded ? "" : "sr-only"}`}
        style={{
          background:
            "repeating-conic-gradient(hsl(var(--muted)) 0% 25%, hsl(var(--background)) 0% 50%) 50% / 16px 16px",
        }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  )
}

export function FigureComparePanel({
  beforeSrc,
  afterSrc,
  title,
}: FigureComparePanelProps) {
  const [activeTab, setActiveTab] = useState("slider")
  const [eraserKey, setEraserKey] = useState(0)

  const handleTabChange = (value: string | number | null) => {
    const prev = activeTab
    const next = String(value)
    setActiveTab(next)
    if (prev !== "eraser" && next === "eraser") {
      setEraserKey((k) => k + 1)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="slider" className="gap-1">
          <SlidersHorizontal className="size-3.5" />
          滑杆对比
        </TabsTrigger>
        <TabsTrigger value="eraser" className="gap-1">
          <Eraser className="size-3.5" />
          橡皮擦对比
        </TabsTrigger>
        <TabsTrigger value="before" className="gap-1">
          <Image className="size-3.5" />
          原图
        </TabsTrigger>
        <TabsTrigger value="after" className="gap-1">
          <Image className="size-3.5" />
          AI 图
        </TabsTrigger>
      </TabsList>

      <TabsContent value="slider" className="mt-4">
        <BeforeAfterSlider
          beforeSrc={beforeSrc}
          afterSrc={afterSrc}
          beforeLabel="Before"
          afterLabel="After"
        />
      </TabsContent>

      <TabsContent value="eraser" className="mt-4">
        <EraserReveal
          key={eraserKey}
          beforeSrc={beforeSrc}
          afterSrc={afterSrc}
          beforeLabel="Before"
          afterLabel="After"
        />
      </TabsContent>

      <TabsContent value="before" className="mt-4">
        <LoadableImage src={beforeSrc} alt={`${title} - 原图`} />
      </TabsContent>

      <TabsContent value="after" className="mt-4">
        <LoadableImage src={afterSrc} alt={`${title} - AI 图`} />
      </TabsContent>
    </Tabs>
  )
}
