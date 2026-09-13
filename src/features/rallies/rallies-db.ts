import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

import {
  rallySchema,
  saveRallyInputSchema,
  type Rally,
  type SaveRallyInput,
} from "./rallies";

let dbPromise: Promise<SQLiteDatabase> | undefined;

function getDb(): Promise<SQLiteDatabase> {
  dbPromise ??= openDatabaseAsync("stamp-log.db").then(async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS rallies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL
      );
    `);
    return db;
  });
  return dbPromise;
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

export async function listRallies(): Promise<Rally[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number;
    name: string;
    type: string;
  }>("SELECT id, name, type FROM rallies ORDER BY id DESC");
  return rows.map((row) => rallySchema.parse(row));
}
