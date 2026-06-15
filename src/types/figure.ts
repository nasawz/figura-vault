export type FigureImageRole = "before" | "after" | "variant" | "reference"

export type FigureImage = {
  id: string
  figureId: string
  imagePath: string
  imageRole: FigureImageRole
  sortOrder: number
  createdAt: string
}

export type Album = {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export type Tag = {
  id: string
  name: string
  color?: string
}

export type FigureItem = {
  id: string
  title: string
  description?: string
  albumId?: string
  album?: Album
  category?: string
  rating: number
  isFavorite: boolean
  images: FigureImage[]
  tags: Tag[]
  createdAt: string
  updatedAt: string
}

export function getAfterImage(item: FigureItem): FigureImage | undefined {
  return item.images.find((img) => img.imageRole === "after")
}

export function getBeforeImage(item: FigureItem): FigureImage | undefined {
  return item.images.find((img) => img.imageRole === "before")
}

export function hasBeforeAfter(item: FigureItem): boolean {
  return Boolean(getAfterImage(item) && getBeforeImage(item))
}
