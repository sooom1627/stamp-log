import { type Rally } from "@/shared/schemas/rallies";
import { type Stamp } from "@/shared/schemas/stamps";
import {
  buildRallyCellRows,
  type MonthShare,
} from "@/shared/utils/month-share-grid";

export type YearShareRow = {
  rally: Rally;
  // Months (1–12) with at least one stamp of this rally.
  months: ReadonlySet<number>;
  // This rally's stamps in the year.
  count: number;
};

export type YearShare = {
  stampCount: number;
  rallyCount: number;
  rows: YearShareRow[];
  rest: MonthShare["rest"];
  // The year's last stamp's rally and month, the only orange cell.
  latest: { rallyId: Rally["id"]; month: number } | null;
  first: { rally: Rally; stampedAt: string } | null;
  last: { rally: Rally; stampedAt: string } | null;
};

// What the year review's pages draw (docs/screens/year-review.md), from one
// year's stamps. Only the stamps of `rallies` count, so a rally turned off in
// the share sheet leaves every page.
export function buildYearShare(stamps: Stamp[], rallies: Rally[]): YearShare {
  const { stampCount, rallyCount, rows, rest, latest, first } =
    buildRallyCellRows(
      stamps,
      rallies,
      (stampedAt) => stampedAt.getMonth() + 1,
    );

  return {
    stampCount,
    rallyCount,
    rows: rows.map(({ rally, cells, count }) => ({
      rally,
      months: cells,
      count,
    })),
    rest,
    latest: latest && { rallyId: latest.rally.id, month: latest.cell },
    first: first && { rally: first.rally, stampedAt: first.stamp.stampedAt },
    last: latest && { rally: latest.rally, stampedAt: latest.stamp.stampedAt },
  };
}
