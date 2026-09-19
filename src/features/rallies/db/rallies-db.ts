import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

import {
  rallySchema,
  saveRallyInputSchema,
  type Rally,
  type SaveRallyInput,
} from "../schemas/rallies";
import {
  parseStampRow,
  saveStampInputSchema,
  type SaveStampInput,
  type Stamp,
} from "../schemas/stamps";

let dbPromise: Promise<SQLiteDatabase> | undefined;

async function stampColumnNames(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<{ name: string }>(
    "PRAGMA table_info(stamps)",
  );
  return rows.map((row) => row.name.toLowerCase());
}

async function ensureTables(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS rallies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL
    );
  `);

  const columns = await stampColumnNames(db);
  if (columns.length > 0 && !columns.includes("rally_id")) {
    await db.execAsync("DROP TABLE stamps");
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS stamps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rally_id INTEGER NOT NULL,
      stamped_at TEXT NOT NULL
    );
  `);
}

export async function getDb(): Promise<SQLiteDatabase> {
  const db = await (dbPromise ??= openDatabaseAsync("stamp-log.db"));
  await ensureTables(db);
  return db;
}

export async function saveRally(input: SaveRallyInput): Promise<void> {
  const { name, type } = saveRallyInputSchema.parse(input);
  const db = await getDb();
  await db.runAsync(
    "INSERT INTO rallies (name, type) VALUES (?, ?)",
    name,
    type,
  );
}

export async function deleteRally(id: Rally["id"]): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM rallies WHERE id = ?", id);
}

export async function listRallies(): Promise<Rally[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number;
    name: string;
    type: string;
  }>("SELECT id, name, type FROM rallies ORDER BY id DESC");
  return rows.map((row) => rallySchema.parse(row));
}

export async function saveStamp(input: SaveStampInput): Promise<Stamp> {
  try {
    const { rallyId } = saveStampInputSchema.parse(input);
    const stampedAt = new Date().toISOString();
    const db = await getDb();
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
  } catch (error) {
    console.warn("[stamps] saveStamp", error);
    throw error;
  }
}

export async function listStamps(): Promise<Stamp[]> {
  try {
    const db = await getDb();
    const rows = await db.getAllAsync<Record<string, unknown>>(
      "SELECT id, rally_id, stamped_at FROM stamps ORDER BY id DESC",
    );
    return rows.map((row) => parseStampRow(row));
  } catch (error) {
    console.warn("[stamps] listStamps", error);
    throw error;
  }
}
