import { type SQLiteDatabase } from "expo-sqlite";

import { getDb } from "@/shared/db/get-db";

import {
  defaultRallyEmoji,
  rallySchema,
  saveRallyInputSchema,
  updateRallyInputSchema,
  type Rally,
  type SaveRallyInput,
  type UpdateRallyInput,
} from "../schemas/rallies";

import { withStampsDb } from "./stamps-db";
import { tableColumnNames } from "./table-columns";

async function ensureRallies(db: SQLiteDatabase) {
  const columns = await tableColumnNames(db, "rallies");
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS rallies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL
    );
  `);

  if (columns.length > 0 && !columns.includes("emoji")) {
    await db.execAsync("ALTER TABLE rallies ADD COLUMN emoji TEXT");
  }

  await db.runAsync(
    "UPDATE rallies SET emoji = ? WHERE emoji IS NULL OR TRIM(emoji) = ''",
    defaultRallyEmoji,
  );

  // Rallies no longer have a type (S-040); its NOT NULL column would block inserts.
  if (columns.includes("type")) {
    await db.execAsync("ALTER TABLE rallies DROP COLUMN type");
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
  const { name, emoji } = saveRallyInputSchema.parse(input);
  const db = await withRalliesDb();
  await db.runAsync(
    "INSERT INTO rallies (name, emoji) VALUES (?, ?)",
    name,
    emoji ?? defaultRallyEmoji,
  );
}

export async function updateRally(input: UpdateRallyInput): Promise<void> {
  const { id, name, emoji } = updateRallyInputSchema.parse(input);
  const db = await withRalliesDb();
  await db.runAsync(
    "UPDATE rallies SET name = ?, emoji = ? WHERE id = ?",
    name,
    emoji,
    id,
  );
}

export async function deleteRally(id: Rally["id"]): Promise<void> {
  const db = await withRalliesDb();
  await withStampsDb();
  // One transaction, so a failed rally delete never leaves its stamps gone.
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync("DELETE FROM stamps WHERE rally_id = ?", id);
    await txn.runAsync("DELETE FROM rallies WHERE id = ?", id);
  });
}

export async function listRallies(): Promise<Rally[]> {
  const db = await withRalliesDb();
  const rows = await db.getAllAsync<{
    id: number;
    name: string;
    emoji: string;
  }>("SELECT id, name, emoji FROM rallies ORDER BY id DESC");
  return rows.map((row) => rallySchema.parse(row));
}
