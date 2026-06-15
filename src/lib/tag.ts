import { select, execute } from "./db"
import type { Tag } from "@/types/figure"

interface TagRow {
  id: string
  name: string
  color: string | null
  created_at: string
  updated_at: string
}

function rowToTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    color: row.color ?? undefined,
  }
}

export async function getAllTags(): Promise<Tag[]> {
  const rows = await select<TagRow>("SELECT * FROM tags ORDER BY created_at")
  return rows.map(rowToTag)
}

export async function createTag(tag: { id: string; name: string; color?: string }): Promise<void> {
  await execute(
    "INSERT INTO tags (id, name, color) VALUES ($1, $2, $3)",
    [tag.id, tag.name, tag.color ?? null]
  )
}

export async function getOrCreateTag(tag: { id: string; name: string; color?: string }): Promise<Tag> {
  const existing = await select<TagRow>("SELECT * FROM tags WHERE name = $1", [tag.name])
  if (existing.length > 0) {
    return rowToTag(existing[0])
  }
  await createTag(tag)
  return { id: tag.id, name: tag.name, color: tag.color }
}
