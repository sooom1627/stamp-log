import {
  defaultRallyEmoji,
  rallySchema,
  saveRallyInputSchema,
  setRallyArchivedInputSchema,
  setRallyFavoriteInputSchema,
  updateRallyInputSchema,
  type Rally,
  type SaveRallyInput,
  type SetRallyArchivedInput,
  type SetRallyFavoriteInput,
  type UpdateRallyInput,
} from "../schemas/rallies";

import { withAppDb } from "./schema";
import { deleteRallyStamps } from "./stamps-db";

export async function saveRally(input: SaveRallyInput): Promise<void> {
  const { name, emoji } = saveRallyInputSchema.parse(input);
  const db = await withAppDb();
  await db.runAsync(
    "INSERT INTO rallies (name, emoji) VALUES (?, ?)",
    name,
    emoji ?? defaultRallyEmoji,
  );
}

export async function updateRally(input: UpdateRallyInput): Promise<void> {
  const { id, name, emoji } = updateRallyInputSchema.parse(input);
  const db = await withAppDb();
  await db.runAsync(
    "UPDATE rallies SET name = ?, emoji = ? WHERE id = ?",
    name,
    emoji,
    id,
  );
}

export async function setRallyFavorite(
  input: SetRallyFavoriteInput,
): Promise<void> {
  const { id, isFavorite } = setRallyFavoriteInputSchema.parse(input);
  const db = await withAppDb();
  await db.runAsync(
    "UPDATE rallies SET is_favorite = ? WHERE id = ?",
    isFavorite ? 1 : 0,
    id,
  );
}

export async function setRallyArchived(
  input: SetRallyArchivedInput,
): Promise<void> {
  const { id, isArchived } = setRallyArchivedInputSchema.parse(input);
  const db = await withAppDb();
  await db.runAsync(
    "UPDATE rallies SET is_archived = ? WHERE id = ?",
    isArchived ? 1 : 0,
    id,
  );
}

export async function deleteRally(id: Rally["id"]): Promise<void> {
  const db = await withAppDb();
  // One transaction, so a failed rally delete never leaves its stamps gone.
  await db.withExclusiveTransactionAsync(async (txn) => {
    await deleteRallyStamps(txn, id);
    await txn.runAsync("DELETE FROM rallies WHERE id = ?", id);
  });
}

export async function listRallies(): Promise<Rally[]> {
  const db = await withAppDb();
  const rows = await db.getAllAsync<{
    id: number;
    name: string;
    emoji: string;
    isFavorite: number;
    isArchived: number;
  }>(
    "SELECT id, name, emoji, is_favorite AS isFavorite, is_archived AS isArchived FROM rallies ORDER BY id DESC",
  );
  return rows.map((row) =>
    rallySchema.parse({
      ...row,
      isFavorite: row.isFavorite === 1,
      isArchived: row.isArchived === 1,
    }),
  );
}
