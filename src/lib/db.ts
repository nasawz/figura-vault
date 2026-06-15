import Database from "@tauri-apps/plugin-sql"

let dbInstance: Database | null = null

export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await Database.load("sqlite:app.db")
  }
  return dbInstance
}

export async function select<T>(query: string, bindValues?: unknown[]): Promise<T[]> {
  const db = await getDb()
  return db.select<T[]>(query, bindValues)
}

export async function execute(query: string, bindValues?: unknown[]) {
  const db = await getDb()
  return db.execute(query, bindValues)
}
