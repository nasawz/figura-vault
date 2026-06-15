import { select, execute } from "./db"
import type { Album } from "@/types/figure"

interface AlbumRow {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

function rowToAlbum(row: AlbumRow): Album {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getAllAlbums(): Promise<Album[]> {
  const rows = await select<AlbumRow>("SELECT * FROM albums ORDER BY created_at")
  return rows.map(rowToAlbum)
}

export async function createAlbum(album: { id: string; name: string; description?: string }): Promise<void> {
  await execute(
    "INSERT INTO albums (id, name, description) VALUES ($1, $2, $3)",
    [album.id, album.name, album.description ?? null]
  )
}
