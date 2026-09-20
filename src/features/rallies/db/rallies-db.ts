import { type SQLiteDatabase } from "expo-sqlite";

import { getDb } from "@/shared/db/get-db";

import {
  rallySchema,
  rallyTypeEmojis,
  saveRallyInputSchema,
  type Rally,
  type SaveRallyInput,
} from "../schemas/rallies";

async function rallyColumnNames(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<{ name: string }>(
    "PRAGMA table_info(rallies)",
  );
  return rows.map((row) => row.name.toLowerCase());
}

async function ensureRallies(db: SQLiteDatabase) {
  const columns = await rallyColumnNames(db);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS rallies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      emoji TEXT NOT NULL
    );
  `);

  if (columns.length > 0 && !columns.includes("emoji")) {
    await db.execAsync("ALTER TABLE rallies ADD COLUMN emoji TEXT");
  }

  await db.execAsync(`
    UPDATE rallies
    SET emoji = CASE type
      WHEN 'person' THEN '😀'
      WHEN 'place' THEN '🏠'
      ELSE '👏'
    END
    WHERE emoji IS NULL OR TRIM(emoji) = '';
  `);
}

async function withRalliesDb() {
  const db = await getDb();
  await ensureRallies(db);
  return db;
}

export async function saveRally(input: SaveRallyInput): Promise<void> {
  const { name, type, emoji } = saveRallyInputSchema.parse(input);
  const db = await withRalliesDb();
  await db.runAsync(
    "INSERT INTO rallies (name, type, emoji) VALUES (?, ?, ?)",
    name,
    type,
    emoji ?? rallyTypeEmojis[type],
  );
}

export async function deleteRally(id: Rally["id"]): Promise<void> {
  const db = await withRalliesDb();
  const stampTables = await db.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'stamps'",
  );
  if (stampTables.length > 0) {
    await db.runAsync("DELETE FROM stamps WHERE rally_id = ?", id);
  }
  await db.runAsync("DELETE FROM rallies WHERE id = ?", id);
}

export async function listRallies(): Promise<Rally[]> {
  const db = await withRalliesDb();
  const rows = await db.getAllAsync<{
    id: number;
    name: string;
    type: string;
    emoji: string;
  }>("SELECT id, name, type, emoji FROM rallies ORDER BY id DESC");
  return rows.map((row) => rallySchema.parse(row));
}
