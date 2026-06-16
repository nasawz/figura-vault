import { useState } from "react"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { createAlbum } from "@/lib/album"

interface AlbumFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (albumId: string) => void
}

export function AlbumFormDialog({
  open,
  onOpenChange,
  onCreated,
}: AlbumFormDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setName("")
    setDescription("")
    setSaving(false)
    setError(null)
  }

  function handleClose(isOpen: boolean) {
    if (saving) return
    if (!isOpen) reset()
    onOpenChange(isOpen)
  }

  async function handleSave() {
    const trimmed = name.trim()
    if (!trimmed || saving) return
    setSaving(true)
    setError(null)
    try {
      const id = crypto.randomUUID()
      await createAlbum({ id, name: trimmed, description: description.trim() || undefined })
      reset()
      onOpenChange(false)
      onCreated(id)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>新建相册</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              名称 <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="相册名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave() }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">描述</label>
            <Textarea
              placeholder="可选描述"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={saving}>
            取消
          </Button>
          <Button disabled={!name.trim() || saving} onClick={handleSave}>
            {saving && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            {saving ? "创建中…" : "创建"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
