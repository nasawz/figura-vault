import type { MouseEvent } from "react"
import { getCurrentWindow } from "@tauri-apps/api/window"

const interactiveSelector =
  "button,a,input,textarea,select,[role='button'],[data-no-window-drag='true']"

export function startWindowDrag(event: MouseEvent<HTMLElement>) {
  if (event.button !== 0) return

  const target = event.target as HTMLElement | null
  if (target?.closest(interactiveSelector)) return

  getCurrentWindow().startDragging().catch(() => {
    // Running in the browser preview has no Tauri window to drag.
  })
}
