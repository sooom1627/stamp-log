import { type Stamp } from "@/shared/schemas/stamps";

import { withAppDb } from "./schema";
import { listStampsWhere } from "./stamps-db";

// Reads that sum the stamps up instead of listing them.

export type StampSummary = {
  // Every stamp, counted by rally.
  countsByRally: Map<Stamp["rallyId"], number>;
  // The stamps at or after `since`, newest first.
  recentStamps: Stamp[];
};

// What rally tiles show: each rally's count over all time, and only the
// recent stamps for the days they draw.
export async function getStampSummary(since: string): Promise<StampSummary> {
  const db = await withAppDb();
  const counts = await db.getAllAsync<{ rallyId: number; count: number }>(
    "SELECT rally_id AS rallyId, COUNT(*) AS count FROM stamps GROUP BY rally_id ORDER BY rally_id",
  );
  return {
    countsByRally: new Map(
      counts.map(({ rallyId, count }) => [rallyId, count]),
    ),
    recentStamps: await listStampsWhere(db, "stamped_at >= ?", since),
  };
}

// The oldest stamp's time, or null without stamps.
export async function getFirstStampedAt(): Promise<Stamp["stampedAt"] | null> {
  const db = await withAppDb();
  const row = await db.getFirstAsync<{ stampedAt: string | null }>(
    "SELECT MIN(stamped_at) AS stampedAt FROM stamps",
  );
  return row?.stampedAt ?? null;
}
