import { select, execute } from "./db"
import type { FigureItem, FigureImage, Album, Tag } from "@/types/figure"

interface FigureRow {
  id: string
  title: string
  description: string | null
  album_id: string | null
  category: string | null
  rating: number
  is_favorite: number
  created_at: string
  updated_at: string
}

interface ImageRow {
  id: string
  figure_id: string
  image_path: string
  image_role: string
  sort_order: number
  created_at: string
}

interface TagRow {
  id: string
  name: string
  color: string | null
}

interface AlbumRow {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

async function assembleFigures(figureRows: FigureRow[]): Promise<FigureItem[]> {
  if (figureRows.length === 0) return []

  const figureIds = figureRows.map((f) => f.id)
  const placeholders = figureIds.map((_, i) => `$${i + 1}`).join(", ")

  const imageRows = await select<ImageRow>(
    `SELECT * FROM figure_images WHERE figure_id IN (${placeholders}) ORDER BY sort_order`,
    figureIds
  )

  const tagRows = await select<TagRow & { figure_id: string }>(
    `SELECT ft.figure_id, t.id, t.name, t.color
     FROM figure_tags ft JOIN tags t ON ft.tag_id = t.id
     WHERE ft.figure_id IN (${placeholders})`,
    figureIds
  )

  const albumIds = [...new Set(figureRows.map((f) => f.album_id).filter(Boolean))]
  let albumMap = new Map<string, Album>()
  if (albumIds.length > 0) {
    const albumPlaceholders = albumIds.map((_, i) => `$${i + 1}`).join(", ")
    const albumRows = await select<AlbumRow>(
      `SELECT * FROM albums WHERE id IN (${albumPlaceholders})`,
      albumIds
    )
    albumMap = new Map(
      albumRows.map((a) => [
        a.id,
        {
          id: a.id,
          name: a.name,
          description: a.description ?? undefined,
          createdAt: a.created_at,
          updatedAt: a.updated_at,
        },
      ])
    )
  }

  const imagesByFigure = new Map<string, FigureImage[]>()
  for (const img of imageRows) {
    const list = imagesByFigure.get(img.figure_id) ?? []
    list.push({
      id: img.id,
      figureId: img.figure_id,
      imagePath: img.image_path,
      imageRole: img.image_role as FigureImage["imageRole"],
      sortOrder: img.sort_order,
      createdAt: img.created_at,
    })
    imagesByFigure.set(img.figure_id, list)
  }

  const tagsByFigure = new Map<string, Tag[]>()
  for (const row of tagRows) {
    const list = tagsByFigure.get(row.figure_id) ?? []
    list.push({ id: row.id, name: row.name, color: row.color ?? undefined })
    tagsByFigure.set(row.figure_id, list)
  }

  return figureRows.map((f) => ({
    id: f.id,
    title: f.title,
    description: f.description ?? undefined,
    albumId: f.album_id ?? undefined,
    album: f.album_id ? albumMap.get(f.album_id) : undefined,
    category: f.category ?? undefined,
    rating: f.rating,
    isFavorite: f.is_favorite === 1,
    images: imagesByFigure.get(f.id) ?? [],
    tags: tagsByFigure.get(f.id) ?? [],
    createdAt: f.created_at,
    updatedAt: f.updated_at,
  }))
}

export async function getAllFigures(): Promise<FigureItem[]> {
  const rows = await select<FigureRow>("SELECT * FROM figures ORDER BY created_at DESC")
  return assembleFigures(rows)
}

export async function getFigureById(id: string): Promise<FigureItem | null> {
  const rows = await select<FigureRow>("SELECT * FROM figures WHERE id = $1", [id])
  if (rows.length === 0) return null
  const results = await assembleFigures(rows)
  return results[0]
}

export async function getFiguresByAlbum(albumId: string): Promise<FigureItem[]> {
  const rows = await select<FigureRow>(
    "SELECT * FROM figures WHERE album_id = $1 ORDER BY created_at DESC",
    [albumId]
  )
  return assembleFigures(rows)
}

export async function getFiguresByTag(tagId: string): Promise<FigureItem[]> {
  const rows = await select<FigureRow>(
    `SELECT f.* FROM figures f
     JOIN figure_tags ft ON f.id = ft.figure_id
     WHERE ft.tag_id = $1
     ORDER BY f.created_at DESC`,
    [tagId]
  )
  return assembleFigures(rows)
}

export async function getFavorites(): Promise<FigureItem[]> {
  const rows = await select<FigureRow>(
    "SELECT * FROM figures WHERE is_favorite = 1 ORDER BY created_at DESC"
  )
  return assembleFigures(rows)
}

export async function createFigure(figure: {
  id: string
  title: string
  description?: string
  albumId?: string
  category?: string
  rating?: number
  isFavorite?: boolean
  images: { id: string; imagePath: string; imageRole: string; sortOrder: number }[]
  tagIds: string[]
}): Promise<void> {
  await execute(
    `INSERT INTO figures (id, title, description, album_id, category, rating, is_favorite)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      figure.id,
      figure.title,
      figure.description ?? null,
      figure.albumId ?? null,
      figure.category ?? null,
      figure.rating ?? 0,
      figure.isFavorite ? 1 : 0,
    ]
  )

  for (const img of figure.images) {
    await execute(
      "INSERT INTO figure_images (id, figure_id, image_path, image_role, sort_order) VALUES ($1, $2, $3, $4, $5)",
      [img.id, figure.id, img.imagePath, img.imageRole, img.sortOrder]
    )
  }

  for (const tagId of figure.tagIds) {
    await execute(
      "INSERT INTO figure_tags (figure_id, tag_id) VALUES ($1, $2)",
      [figure.id, tagId]
    )
  }
}

export async function updateFigure(input: {
  id: string
  title: string
  description?: string
  albumId?: string
  isFavorite: boolean
  tagIds: string[]
  images: { id: string; imagePath: string; imageRole: string; sortOrder: number }[]
}): Promise<void> {
  await execute(
    `UPDATE figures SET title = $1, description = $2, album_id = $3, is_favorite = $4, updated_at = datetime('now') WHERE id = $5`,
    [
      input.title,
      input.description ?? null,
      input.albumId ?? null,
      input.isFavorite ? 1 : 0,
      input.id,
    ]
  )

  await execute("DELETE FROM figure_tags WHERE figure_id = $1", [input.id])
  for (const tagId of input.tagIds) {
    await execute(
      "INSERT INTO figure_tags (figure_id, tag_id) VALUES ($1, $2)",
      [input.id, tagId]
    )
  }

  await execute("DELETE FROM figure_images WHERE figure_id = $1", [input.id])
  for (const img of input.images) {
    await execute(
      "INSERT INTO figure_images (id, figure_id, image_path, image_role, sort_order) VALUES ($1, $2, $3, $4, $5)",
      [img.id, input.id, img.imagePath, img.imageRole, img.sortOrder]
    )
  }
}

export async function deleteFigure(id: string): Promise<void> {
  await execute("DELETE FROM figures WHERE id = $1", [id])
}

export async function toggleFavorite(id: string): Promise<boolean> {
  const rows = await select<{ is_favorite: number }>(
    "SELECT is_favorite FROM figures WHERE id = $1",
    [id]
  )
  if (rows.length === 0) throw new Error(`Figure ${id} not found`)

  const newValue = rows[0].is_favorite === 1 ? 0 : 1
  await execute(
    "UPDATE figures SET is_favorite = $1, updated_at = datetime('now') WHERE id = $2",
    [newValue, id]
  )
  return newValue === 1
}
