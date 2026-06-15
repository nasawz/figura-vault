import { useState, useEffect } from "react"
import { toImageSrc } from "@/lib/file"

export function useImageSrc(relativePath: string | undefined): string | undefined {
  const [src, setSrc] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!relativePath) {
      setSrc(undefined)
      return
    }

    let cancelled = false
    toImageSrc(relativePath).then((url) => {
      if (!cancelled) setSrc(url)
    })
    return () => { cancelled = true }
  }, [relativePath])

  return src
}
