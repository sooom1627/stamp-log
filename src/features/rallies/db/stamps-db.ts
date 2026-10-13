import { type SQLiteDatabase } from "expo-sqlite";

import {
  hasStampOnLocalDay,
  sameDayStampMessage,
  saveStampInputSchema,
  stampSchema,
  updateStampInputSchema,
  updateStampMemoInputSchema,
  type SaveStampInput,
  type Stamp,
  type UpdateStampInput,
  type UpdateStampMemoInput,
} from "../schemas/stamps";

import { withAppDb } from "./schema";

const stampColumns = "id, rally_id AS rallyId, stamped_at AS stampedAt, memo";

async function findStamp(db: SQLiteDatabase, id: Stamp["id"]) {
  const row = await db.getFirstAsync<Stamp>(
    `SELECT ${stampColumns} FROM stamps WHERE id = ?`,
    id,
  );
  if (!row) {
    throw new Error("Stamp not found");
  }
  return stampSchema.parse(row);
}

async function assertNoStampOnLocalDay(
  db: SQLiteDatabase,
  target: Parameters<typeof hasStampOnLocalDay>[1],
) {
  const stamps = await db.getAllAsync<Stamp>(
    `SELECT ${stampColumns} FROM stamps WHERE rally_id = ?`,
    target.rallyId,
  );
  if (hasStampOnLocalDay(stamps, target)) {
    throw new Error(sameDayStampMessage);
  }
}

export async function saveStamp(input: SaveStampInput): Promise<Stamp> {
  const parsed = saveStampInputSchema.parse(input);
  const { rallyId } = parsed;
  const stampedAt = parsed.stampedAt ?? new Date().toISOString();
  const db = await withAppDb();
  if (parsed.stampedAt !== undefined) {
    await assertNoStampOnLocalDay(db, { rallyId, date: new Date(stampedAt) });
  }
  const result = await db.runAsync(
    "INSERT INTO stamps (rally_id, stamped_at) VALUES (?, ?)",
    rallyId,
    stampedAt,
  );
  return stampSchema.parse({
    id: result.lastInsertRowId,
    rallyId,
    stampedAt,
    memo: null,
  });
}

export async function listStamps(): Promise<Stamp[]> {
  const db = await withAppDb();
  const rows = await db.getAllAsync<Stamp>(
    `SELECT ${stampColumns} FROM stamps ORDER BY stamped_at DESC, id DESC`,
  );
  return rows.map((row) => stampSchema.parse(row));
}

export async function updateStampMemo(
  input: UpdateStampMemoInput,
): Promise<Stamp> {
  const { id, memo } = updateStampMemoInputSchema.parse(input);
  const db = await withAppDb();
  const current = await findStamp(db, id);
  await db.runAsync("UPDATE stamps SET memo = ? WHERE id = ?", memo, id);
  return stampSchema.parse({ ...current, memo });
}

export async function updateStamp(input: UpdateStampInput): Promise<Stamp> {
  const { id, stampedAt, memo } = updateStampInputSchema.parse(input);
  const db = await withAppDb();
  const current = await findStamp(db, id);
  await assertNoStampOnLocalDay(db, {
    rallyId: current.rallyId,
    date: new Date(stampedAt),
    excludedId: id,
  });
  await db.runAsync(
    "UPDATE stamps SET stamped_at = ?, memo = ? WHERE id = ?",
    stampedAt,
    memo,
    id,
  );
  return stampSchema.parse({ ...current, stampedAt, memo });
}

export async function deleteStamp(id: Stamp["id"]): Promise<void> {
  const db = await withAppDb();
  await db.runAsync("DELETE FROM stamps WHERE id = ?", id);
}

// Runs in the caller's transaction, so deleting a rally and its stamps
// succeeds or fails as one.
export async function deleteRallyStamps(
  txn: SQLiteDatabase,
  rallyId: Stamp["rallyId"],
): Promise<void> {
  await txn.runAsync("DELETE FROM stamps WHERE rally_id = ?", rallyId);
}
