import { type Rally } from "@/shared/schemas/rallies";
import { type Stamp } from "@/shared/schemas/stamps";

// The month and year images draw at most this many rally rows
// (docs/screens/share-image.md).
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

export type RallyCellRows = {
  stampCount: number;
  rallyCount: number;
  rows: { rally: Rally; cells: ReadonlySet<number>; count: number }[];
  rest: MonthShare["rest"];
  // The newest stamp and its cell.
  latest: { stamp: Stamp; rally: Rally; cell: number } | null;
  // The oldest stamp.
  first: { stamp: Stamp; rally: Rally } | null;
};

// The rows the month and year images share: one row per rally with stamps
// (only rallies in `rallies` count), most stamped first and, with the same
// count, in the order of `rallies` (home's tile order). `cellOf` gives the
// column a stamp's time falls in (a day of the month, or a month).
export function buildRallyCellRows(
  stamps: Stamp[],
  rallies: Rally[],
  cellOf: (stampedAt: Date) => number,
): RallyCellRows {
  const ralliesById = new Map(rallies.map((rally) => [rally.id, rally]));
  const rowsByRally = new Map<
    Rally["id"],
    { cells: Set<number>; count: number }
  >();
  let latest: RallyCellRows["latest"] = null;
  let first: RallyCellRows["first"] = null;
  let stampCount = 0;

  for (const stamp of stamps) {
    const rally = ralliesById.get(stamp.rallyId);
    if (!rally) continue;
    const cell = cellOf(new Date(stamp.stampedAt));
    const row = rowsByRally.get(rally.id) ?? { cells: new Set(), count: 0 };
    row.cells.add(cell);
    row.count += 1;
    rowsByRally.set(rally.id, row);
    stampCount += 1;
    if (!latest || stamp.stampedAt > latest.stamp.stampedAt) {
      latest = { stamp, rally, cell };
    }
    if (!first || stamp.stampedAt < first.stamp.stampedAt) {
      first = { stamp, rally };
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
    stampCount,
    rallyCount: allRows.length,
    rows,
    rest: fitsAll
      ? null
      : {
          rallyCount: restRows.length,
          stampCount: restRows.reduce((sum, row) => sum + row.count, 0),
        },
    latest,
    first,
  };
}

// What the month image and home's last-month card draw: one row per rally
// stamped in `month` (its first local day). One cell per stamped day; a day
// stamped twice is still one cell.
export function buildMonthShare(
  month: Date,
  stamps: Stamp[],
  rallies: Rally[],
): MonthShare {
  const { stampCount, rallyCount, rows, rest, latest } = buildRallyCellRows(
    stamps,
    rallies,
    (stampedAt) => stampedAt.getDate(),
  );

  return {
    daysInMonth: new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    ).getDate(),
    stampCount,
    rallyCount,
    rows: rows.map(({ rally, cells, count }) => ({
      rally,
      days: cells,
      count,
    })),
    rest,
    latest: latest && { rallyId: latest.rally.id, day: latest.cell },
  };
}
