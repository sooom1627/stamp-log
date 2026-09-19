import { type SQLiteDatabase } from "expo-sqlite";

import { getDb } from "@/shared/db/get-db";

import {
  rallySchema,
  saveRallyInputSchema,
  type Rally,
  type SaveRallyInput,
} from "../schemas/rallies";

import { deleteStampsForRally } from "./stamps-db";

async function ensureRallies(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS rallies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL
    );
  `);
}

async function withRalliesDb() {
  const db = await getDb();
  await ensureRallies(db);
  return db;
}

export async function saveRally(input: SaveRallyInput): Promise<void> {
  const { name, type } = saveRallyInputSchema.parse(input);
  const db = await withRalliesDb();
  await db.runAsync(
    "INSERT INTO rallies (name, type) VALUES (?, ?)",
    name,
    type,
  );
}

export async function deleteRally(id: Rally["id"]): Promise<void> {
  await deleteStampsForRally(id);
  const db = await withRalliesDb();
  await db.runAsync("DELETE FROM rallies WHERE id = ?", id);
}

export async function listRallies(): Promise<Rally[]> {
  const db = await withRalliesDb();
  const rows = await db.getAllAsync<{
    id: number;
    name: string;
    type: string;
  }>("SELECT id, name, type FROM rallies ORDER BY id DESC");
  return rows.map((row) => rallySchema.parse(row));
}
