import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type PointerEvent as ReactPointerEvent,
} from "react"
import { Loader2, ImageOff, RotateCcw } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

interface EraserRevealProps {
  beforeSrc?: string
  afterSrc?: string
  beforeLabel?: string
  afterLabel?: string
}

type ImageState = "loading" | "loaded" | "error"

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.crossOrigin = "anonymous"
    img.src = src
  })
}

export function EraserReveal({
  beforeSrc,
  afterSrc,
  beforeLabel = "Before",
  afterLabel = "After",
}: EraserRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const afterImgRef = useRef<HTMLImageElement | null>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)

  const [beforeState, setBeforeState] = useState<ImageState>("loading")
  const [afterState, setAfterState] = useState<ImageState>("loading")
  const [brushSize, setBrushSize] = useState(30)

  const bothLoaded = beforeState === "loaded" && afterState === "loaded"
  const hasError =
    beforeState === "error" ||
    afterState === "error" ||
    !beforeSrc ||
    !afterSrc

  const drawAfterToCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    const afterImg = afterImgRef.current
    if (!canvas || !container || !afterImg) return

    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    const w = rect.width
    const h = rect.height

    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalCompositeOperation = "source-over"

    // object-contain math: fit afterImg into (w, h)
    const imgRatio = afterImg.naturalWidth / afterImg.naturalHeight
    const boxRatio = w / h
    let dw: number, dh: number, dx: number, dy: number
    if (imgRatio > boxRatio) {
      dw = w
      dh = w / imgRatio
      dx = 0
      dy = (h - dh) / 2
    } else {
      dh = h
      dw = h * imgRatio
      dx = (w - dw) / 2
      dy = 0
    }

    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(afterImg, dx, dy, dw, dh)
  }, [])

  // Load before image
  useEffect(() => {
    if (!beforeSrc) {
      setBeforeState("error")
      return
    }
    setBeforeState("loading")
    const img = new window.Image()
    img.onload = () => setBeforeState("loaded")
    img.onerror = () => setBeforeState("error")
    img.src = beforeSrc
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [beforeSrc])

  // Load after image and draw to canvas
  useEffect(() => {
    if (!afterSrc) {
      setAfterState("error")
      return
    }
    setAfterState("loading")
    let cancelled = false
    loadImage(afterSrc)
      .then((img) => {
        if (cancelled) return
        afterImgRef.current = img
        setAfterState("loaded")
      })
      .catch(() => {
        if (!cancelled) setAfterState("error")
      })
    return () => {
      cancelled = true
    }
  }, [afterSrc])

  // Draw canvas when after image loads or container resizes
  useEffect(() => {
    if (afterState !== "loaded") return
    drawAfterToCanvas()

    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(() => drawAfterToCanvas())
    ro.observe(container)
    return () => ro.disconnect()
  }, [afterState, drawAfterToCanvas])

  const getCanvasPoint = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    },
    [],
  )

  const eraseAt = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = "destination-out"
      ctx.beginPath()
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    },
    [brushSize],
  )

  const eraseLine = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = "destination-out"
      ctx.lineWidth = brushSize
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()
      ctx.restore()
    },
    [brushSize],
  )

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!bothLoaded) return
      e.preventDefault()
      drawingRef.current = true
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      const pt = getCanvasPoint(e)
      if (pt) {
        lastPointRef.current = pt
        eraseAt(pt.x, pt.y)
      }
    },
    [bothLoaded, getCanvasPoint, eraseAt],
  )

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) return
      e.preventDefault()
      const pt = getCanvasPoint(e)
      if (!pt) return
      const last = lastPointRef.current
      if (last) {
        eraseLine(last, pt)
      } else {
        eraseAt(pt.x, pt.y)
      }
      lastPointRef.current = pt
    },
    [getCanvasPoint, eraseAt, eraseLine],
  )

  const onPointerEnd = useCallback(() => {
    drawingRef.current = false
    lastPointRef.current = null
  }, [])

  const handleReset = useCallback(() => {
    drawAfterToCanvas()
  }, [drawAfterToCanvas])

  if (hasError) {
    return (
      <div className="flex aspect-[9/16] w-full flex-col items-center justify-center gap-2 rounded-lg border bg-muted/30">
        <ImageOff className="size-8 text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground">图片加载失败</p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Loading state */}
      {!bothLoaded && (
        <div className="flex aspect-[9/16] w-full items-center justify-center rounded-lg border bg-muted/30">
          <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
        </div>
      )}

      {/* Canvas area */}
      <div
        ref={containerRef}
        className={`relative aspect-[9/16] w-full overflow-hidden rounded-lg border ${
          bothLoaded ? "" : "sr-only"
        }`}
        style={{
          touchAction: "none",
          background:
            "repeating-conic-gradient(hsl(var(--muted)) 0% 25%, hsl(var(--background)) 0% 50%) 50% / 16px 16px",
        }}
      >
        {/* Before layer (bottom) */}
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className="absolute inset-0 size-full object-contain"
          draggable={false}
        />

        {/* After canvas (top, erasable) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 size-full cursor-crosshair"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        />

        {/* Labels */}
        <span className="pointer-events-none absolute top-2.5 left-2.5 rounded bg-black/50 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {beforeLabel}
        </span>
        <span className="pointer-events-none absolute top-2.5 right-2.5 rounded bg-black/50 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {afterLabel}
        </span>
      </div>

      {/* Controls */}
      {bothLoaded && (
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-xs text-muted-foreground">
            画笔 {brushSize}px
          </span>
          <Slider
            className="flex-1"
            min={10}
            max={100}
            step={5}
            value={[brushSize]}
            onValueChange={(val) => {
              const v = Array.isArray(val) ? val[0] : val
              setBrushSize(v)
            }}
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handleReset}
          >
            <RotateCcw className="size-3.5" />
            重置
          </Button>
        </div>
      )}
    </div>
  )
}
