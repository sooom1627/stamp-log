import { type SQLiteDatabase } from "expo-sqlite";

import { getDb } from "@/shared/db/get-db";
import { localDateKey } from "@/shared/utils/local-date-key";

import {
  parseStampRow,
  saveStampInputSchema,
  updateStampInputSchema,
  updateStampMemoInputSchema,
  type SaveStampInput,
  type Stamp,
  type UpdateStampInput,
  type UpdateStampMemoInput,
} from "../schemas/stamps";

import { tableColumnNames } from "./table-columns";

async function ensureStamps(db: SQLiteDatabase) {
  let columns = await tableColumnNames(db, "stamps");
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

let stampsDbReady: Promise<SQLiteDatabase> | undefined;

// Sets up the table once per app start; a failed setup is retried on the next call.
export function withStampsDb() {
  stampsDbReady ??= getDb()
    .then(async (db) => {
      await ensureStamps(db);
      return db;
    })
    .catch((error: unknown) => {
      stampsDbReady = undefined;
      throw error;
    });
  return stampsDbReady;
}

async function hasStampOnLocalDay(
  db: SQLiteDatabase,
  rallyId: number,
  stampedAt: string,
  excludedId?: number,
) {
  const rows = await db.getAllAsync<{ id: number; stamped_at: string }>(
    "SELECT id, stamped_at FROM stamps WHERE rally_id = ?",
    rallyId,
  );
  const dayKey = localDateKey(new Date(stampedAt));
  return rows.some(
    (row) =>
      row.id !== excludedId &&
      localDateKey(new Date(row.stamped_at)) === dayKey,
  );
}

export async function saveStamp(input: SaveStampInput): Promise<Stamp> {
  const parsed = saveStampInputSchema.parse(input);
  const { rallyId } = parsed;
  const stampedAt = parsed.stampedAt ?? new Date().toISOString();
  const db = await withStampsDb();
  if (
    parsed.stampedAt !== undefined &&
    (await hasStampOnLocalDay(db, rallyId, stampedAt))
  ) {
    throw new Error("This rally already has a stamp on that day");
  }
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
    "SELECT id, rally_id, stamped_at, memo FROM stamps ORDER BY stamped_at DESC, id DESC",
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

export async function updateStamp(input: UpdateStampInput): Promise<Stamp> {
  const { id, stampedAt, memo } = updateStampInputSchema.parse(input);
  const db = await withStampsDb();
  const current = await db.getFirstAsync<{ rally_id: number }>(
    "SELECT rally_id FROM stamps WHERE id = ?",
    id,
  );
  if (!current) {
    throw new Error("Stamp not found");
  }
  if (await hasStampOnLocalDay(db, current.rally_id, stampedAt, id)) {
    throw new Error("This rally already has a stamp on that day");
  }
  await db.runAsync(
    "UPDATE stamps SET stamped_at = ?, memo = ? WHERE id = ?",
    stampedAt,
    memo,
    id,
  );
  return parseStampRow({ id, rallyId: current.rally_id, stampedAt, memo });
}

export async function deleteStamp(id: Stamp["id"]): Promise<void> {
  const db = await withStampsDb();
  await db.runAsync("DELETE FROM stamps WHERE id = ?", id);
}
