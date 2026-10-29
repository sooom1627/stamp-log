import { listRallies } from "@/shared/db/rallies-db";
import { withAppDb } from "@/shared/db/schema";
import { deleteStampPhotoFiles } from "@/shared/db/stamp-photo-files";
import { listStamps } from "@/shared/db/stamps-db";

import { backupSchema, type Backup } from "../schemas/backup";

// Every rally (archived ones too) and every stamp, as Export data writes them.
// The schema leaves the stamps' photos out (S-042).
export async function readBackup(): Promise<Backup> {
  const [rallies, stamps] = await Promise.all([listRallies(), listStamps()]);
  return backupSchema.parse({
    app: "stamp-log",
    version: 1,
    exportedAt: new Date().toISOString(),
    rallies,
    stamps,
  });
}

// Replaces this device's data with the file's, keeping the file's ids so each
// stamp stays with its rally. One transaction: if any insert fails, the data
// stays as it was. This device's photos go too (the file has none yet), and
// their files are removed only after the transaction is saved.
export async function replaceWithBackup(backup: Backup): Promise<void> {
  const { rallies, stamps } = backupSchema.parse(backup);
  const db = await withAppDb();
  let photoFileNames: string[] = [];
  await db.withExclusiveTransactionAsync(async (txn) => {
    const photos = await txn.getAllAsync<{ fileName: string }>(
      "SELECT file_name AS fileName FROM stamp_photos",
    );
    photoFileNames = photos.map(({ fileName }) => fileName);
    await txn.runAsync("DELETE FROM stamp_photos");
    await txn.runAsync("DELETE FROM stamps");
    await txn.runAsync("DELETE FROM rallies");
    for (const { id, name, emoji, isFavorite, isArchived } of rallies) {
      await txn.runAsync(
        "INSERT INTO rallies (id, name, emoji, is_favorite, is_archived) VALUES (?, ?, ?, ?, ?)",
        id,
        name,
        emoji,
        isFavorite ? 1 : 0,
        isArchived ? 1 : 0,
      );
    }
    for (const { id, rallyId, stampedAt, memo } of stamps) {
      await txn.runAsync(
        "INSERT INTO stamps (id, rally_id, stamped_at, memo) VALUES (?, ?, ?, ?)",
        id,
        rallyId,
        stampedAt,
        memo,
      );
    }
  });
  deleteStampPhotoFiles(photoFileNames);
}
