import { listRallies } from "@/features/rallies/db/rallies-db";
import { listStamps } from "@/features/rallies/db/stamps-db";

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
