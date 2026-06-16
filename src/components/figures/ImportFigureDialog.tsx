import type { Album, Tag } from "@/types/figure"
import { FigureFormDialog } from "./FigureFormDialog"

interface ImportFigureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  albums: Album[]
  tags: Tag[]
  onImported: () => void
}

export function ImportFigureDialog({
  open,
  onOpenChange,
  albums,
  tags,
  onImported,
}: ImportFigureDialogProps) {
  return (
    <FigureFormDialog
      mode="create"
      open={open}
      onOpenChange={onOpenChange}
      albums={albums}
      tags={tags}
      onSaved={onImported}
    />
  )
}
