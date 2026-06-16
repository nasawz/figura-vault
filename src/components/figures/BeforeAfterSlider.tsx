import { useState, useRef, useCallback, useEffect } from "react"
import { Loader2, ImageOff } from "lucide-react"

interface BeforeAfterSliderProps {
  beforeSrc?: string
  afterSrc?: string
  beforeLabel?: string
  afterLabel?: string
}

type ImageState = "loading" | "loaded" | "error"

const DEFAULT_SLIDER_POSITION = 100 / 6

function useImageLoadState(src: string | undefined): ImageState {
  const [state, setState] = useState<ImageState>(src ? "loading" : "error")

  useEffect(() => {
    if (!src) {
      setState("error")
      return
    }
    setState("loading")
    const img = new Image()
    img.onload = () => setState("loaded")
    img.onerror = () => setState("error")
    img.src = src
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return state
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "Before",
  afterLabel = "After",
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(DEFAULT_SLIDER_POSITION)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const beforeState = useImageLoadState(beforeSrc)
  const afterState = useImageLoadState(afterSrc)

  const bothLoaded = beforeState === "loaded" && afterState === "loaded"
  const hasError = beforeState === "error" || afterState === "error"

  const calcPosition = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = clientX - rect.left
    const pct = Math.min(100, Math.max(0, (x / rect.width) * 100))
    setPosition(pct)
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!bothLoaded) return
      e.preventDefault()
      setDragging(true)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      calcPosition(e.clientX)
    },
    [bothLoaded, calcPosition],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return
      e.preventDefault()
      calcPosition(e.clientX)
    },
    [dragging, calcPosition],
  )

  const onPointerEnd = useCallback(() => {
    setDragging(false)
  }, [])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!bothLoaded) return
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          setPosition((p) => Math.max(0, p - 2))
          break
        case "ArrowRight":
          e.preventDefault()
          setPosition((p) => Math.min(100, p + 2))
          break
        case "Home":
          e.preventDefault()
          setPosition(0)
          break
        case "End":
          e.preventDefault()
          setPosition(100)
          break
      }
    },
    [bothLoaded],
  )

  if (hasError) {
    return (
      <div className="flex aspect-[9/16] w-full flex-col items-center justify-center gap-2 rounded-lg border bg-muted/30">
        <ImageOff className="size-8 text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground">图片加载失败</p>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {!bothLoaded && (
        <div className="flex aspect-[9/16] w-full items-center justify-center rounded-lg border bg-muted/30">
          <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
        </div>
      )}

      <div
        ref={containerRef}
        role="slider"
        aria-label="Before / After 对比滑杆"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        tabIndex={bothLoaded ? 0 : -1}
        className={`relative aspect-[9/16] w-full overflow-hidden rounded-lg border select-none ${
          bothLoaded ? "" : "sr-only"
        } ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{
          background:
            "repeating-conic-gradient(hsl(var(--muted)) 0% 25%, hsl(var(--background)) 0% 50%) 50% / 16px 16px",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onKeyDown={onKeyDown}
      >
        {/* Before layer (bottom) */}
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className="absolute inset-0 size-full object-contain"
          draggable={false}
        />

        {/* After layer (top, clipped) */}
        <img
          src={afterSrc}
          alt={afterLabel}
          className="absolute inset-0 size-full object-contain"
          style={{ clipPath: `inset(0 0 0 ${position}%)` }}
          draggable={false}
        />

        {/* Handle */}
        <div
          className="absolute inset-y-0 z-10 -translate-x-1/2"
          style={{ left: `${position}%` }}
        >
          {/* Vertical line */}
          <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_4px_rgba(0,0,0,0.4)]" />

          {/* Drag handle */}
          <div className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-white/90 shadow-lg backdrop-blur-sm">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-neutral-700"
            >
              <path
                d="M5 3L1 8L5 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11 3L15 8L11 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <span className="absolute top-2.5 left-2.5 rounded bg-black/50 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {beforeLabel}
        </span>
        <span className="absolute top-2.5 right-2.5 rounded bg-black/50 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {afterLabel}
        </span>
      </div>
    </div>
  )
}
