import { type SQLiteDatabase } from "expo-sqlite";

import { getDb } from "@/shared/db/get-db";

import {
  parseStampRow,
  saveStampInputSchema,
  updateStampMemoInputSchema,
  type SaveStampInput,
  type Stamp,
  type UpdateStampMemoInput,
} from "../schemas/stamps";

async function stampColumnNames(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<{ name: string }>(
    "PRAGMA table_info(stamps)",
  );
  return rows.map((row) => row.name.toLowerCase());
}

async function ensureStamps(db: SQLiteDatabase) {
  let columns = await stampColumnNames(db);
  if (columns.length > 0 && !columns.includes("rally_id")) {
    await db.execAsync("DROP TABLE stamps");
    columns = [];
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS stamps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rally_id INTEGER NOT NULL,
      stamped_at TEXT NOT NULL,
      memo TEXT
    );
  `);

  if (columns.length > 0 && !columns.includes("memo")) {
    await db.execAsync("ALTER TABLE stamps ADD COLUMN memo TEXT");
  }
}

async function withStampsDb() {
  const db = await getDb();
  await ensureStamps(db);
  return db;
}

export async function saveStamp(input: SaveStampInput): Promise<Stamp> {
  const { rallyId } = saveStampInputSchema.parse(input);
  const stampedAt = new Date().toISOString();
  const db = await withStampsDb();
  const result = await db.runAsync(
    "INSERT INTO stamps (rally_id, stamped_at) VALUES (?, ?)",
    rallyId,
    stampedAt,
  );
  return parseStampRow({
    id: result.lastInsertRowId,
    rallyId,
    stampedAt,
  });
}

export async function listStamps(): Promise<Stamp[]> {
  const db = await withStampsDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    "SELECT id, rally_id, stamped_at, memo FROM stamps ORDER BY id DESC",
  );
  return rows.map((row) => parseStampRow(row));
}

export async function updateStampMemo(
  input: UpdateStampMemoInput,
): Promise<Stamp> {
  const { id, memo } = updateStampMemoInputSchema.parse(input);
  const db = await withStampsDb();
  await db.runAsync("UPDATE stamps SET memo = ? WHERE id = ?", memo, id);
  const row = await db.getFirstAsync<Record<string, unknown>>(
    "SELECT id, rally_id, stamped_at, memo FROM stamps WHERE id = ?",
    id,
  );
  return parseStampRow(row ?? {});
}
