import { type SQLiteDatabase } from "expo-sqlite";

import { getDb } from "@/shared/db/get-db";

import {
  rallySchema,
  rallyTypeEmojis,
  saveRallyInputSchema,
  type Rally,
  type SaveRallyInput,
} from "../schemas/rallies";

import { withStampsDb } from "./stamps-db";
import { tableColumnNames } from "./table-columns";

async function ensureRallies(db: SQLiteDatabase) {
  const columns = await tableColumnNames(db, "rallies");
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

  for (const [type, emoji] of Object.entries(rallyTypeEmojis)) {
    await db.runAsync(
      "UPDATE rallies SET emoji = ? WHERE type = ? AND (emoji IS NULL OR TRIM(emoji) = '')",
      emoji,
      type,
    );
  }
}

let ralliesDbReady: Promise<SQLiteDatabase> | undefined;

// Sets up the table once per app start; a failed setup is retried on the next call.
function withRalliesDb() {
  ralliesDbReady ??= getDb()
    .then(async (db) => {
      await ensureRallies(db);
      return db;
    })
    .catch((error: unknown) => {
      ralliesDbReady = undefined;
      throw error;
    });
  return ralliesDbReady;
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
  await withStampsDb();
  await db.runAsync("DELETE FROM stamps WHERE rally_id = ?", id);
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
