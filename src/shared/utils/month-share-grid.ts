import { type Rally } from "@/shared/schemas/rallies";
import { type Stamp } from "@/shared/schemas/stamps";

// A month image draws at most this many rally rows (docs/screens/share-image.md).
const MAX_ROWS = 6;

export type MonthShareRow = {
  rally: Rally;
  // Days of the month (1–31) with at least one stamp of this rally.
  days: ReadonlySet<number>;
  // This rally's stamps in the month.
  count: number;
};

export type MonthShare = {
  daysInMonth: number;
  stampCount: number;
  rallyCount: number;
  rows: MonthShareRow[];
  // The rallies past the rows, summed into one line; null when all fit.
  rest: { rallyCount: number; stampCount: number } | null;
  // The month's last stamp, the only orange cell.
  latest: { rallyId: Rally["id"]; day: number } | null;
};

// What the month image and home's last-month card draw: one row per rally
// stamped in `month` (its first local day), most stamped first and, with the
// same count, in the order of `rallies` (home's tile order). One cell per
// stamped day; a day stamped twice is still one cell.
export function buildMonthShare(
  month: Date,
  stamps: Stamp[],
  rallies: Rally[],
): MonthShare {
  const ralliesById = new Map(rallies.map((rally) => [rally.id, rally]));
  const rowsByRally = new Map<
    Rally["id"],
    { days: Set<number>; count: number }
  >();
  let latest: { time: number; rallyId: Rally["id"]; day: number } | null = null;
  let stampCount = 0;

  for (const stamp of stamps) {
    if (!ralliesById.has(stamp.rallyId)) continue;
    const stampedAt = new Date(stamp.stampedAt);
    const day = stampedAt.getDate();
    const row = rowsByRally.get(stamp.rallyId) ?? { days: new Set(), count: 0 };
    row.days.add(day);
    row.count += 1;
    rowsByRally.set(stamp.rallyId, row);
    stampCount += 1;
    if (!latest || stampedAt.getTime() > latest.time) {
      latest = { time: stampedAt.getTime(), rallyId: stamp.rallyId, day };
    }
  }

  // Array sort is stable, so rallies with the same count keep `rallies` order.
  const allRows = rallies
    .flatMap((rally) => {
      const row = rowsByRally.get(rally.id);
      return row ? [{ rally, ...row }] : [];
    })
    .sort((a, b) => b.count - a.count);
  const fitsAll = allRows.length <= MAX_ROWS;
  const rows = fitsAll ? allRows : allRows.slice(0, MAX_ROWS - 1);
  const restRows = allRows.slice(rows.length);

  return {
    daysInMonth: new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    ).getDate(),
    stampCount,
    rallyCount: allRows.length,
    rows,
    rest: fitsAll
      ? null
      : {
          rallyCount: restRows.length,
          stampCount: restRows.reduce((sum, row) => sum + row.count, 0),
        },
    latest: latest && { rallyId: latest.rallyId, day: latest.day },
  };
}
