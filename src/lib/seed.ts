import { select, execute } from "./db"
import { mockAlbums, mockTags, mockFigures } from "@/data/mockFigures"

export async function seedIfEmpty(): Promise<void> {
  const existing = await select<{ count: number }>("SELECT COUNT(*) as count FROM figures")
  if (existing[0].count > 0) return

  for (const album of mockAlbums) {
    await execute(
      "INSERT OR IGNORE INTO albums (id, name, description) VALUES ($1, $2, $3)",
      [album.id, album.name, album.description ?? null]
    )
  }

  for (const tag of mockTags) {
    await execute(
      "INSERT OR IGNORE INTO tags (id, name, color) VALUES ($1, $2, $3)",
      [tag.id, tag.name, tag.color ?? null]
    )
  }

  for (const figure of mockFigures) {
    await execute(
      `INSERT OR IGNORE INTO figures (id, title, description, album_id, category, rating, is_favorite)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        figure.id,
        figure.title,
        figure.description ?? null,
        figure.albumId ?? null,
        figure.category ?? null,
        figure.rating,
        figure.isFavorite ? 1 : 0,
      ]
    )

    for (const img of figure.images) {
      await execute(
        "INSERT OR IGNORE INTO figure_images (id, figure_id, image_path, image_role, sort_order) VALUES ($1, $2, $3, $4, $5)",
        [img.id, figure.id, img.imagePath, img.imageRole, img.sortOrder]
      )
    }

    for (const tag of figure.tags) {
      await execute(
        "INSERT OR IGNORE INTO figure_tags (figure_id, tag_id) VALUES ($1, $2)",
        [figure.id, tag.id]
      )
    }
  }
}
