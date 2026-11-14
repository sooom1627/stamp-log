import { type Stamp } from "@/shared/schemas/stamps";

export type LookBackYear = {
  year: number;
  // Months with stamps, newest first; `month` is its first local day.
  months: { month: Date; stampCount: number }[];
};

// The look-back sheet's list: the years and months with stamps, newest
// first (docs/screens/look-back.md).
export function lookBackYears(stamps: Stamp[]): LookBackYear[] {
  const countsByMonth = new Map<number, number>();
  for (const stamp of stamps) {
    const stampedAt = new Date(stamp.stampedAt);
    const key = stampedAt.getFullYear() * 12 + stampedAt.getMonth();
    countsByMonth.set(key, (countsByMonth.get(key) ?? 0) + 1);
  }

  const years: LookBackYear[] = [];
  for (const key of [...countsByMonth.keys()].sort((a, b) => b - a)) {
    const year = Math.floor(key / 12);
    const month = {
      month: new Date(year, key % 12, 1),
      stampCount: countsByMonth.get(key) ?? 0,
    };
    const last = years.at(-1);
    if (last?.year === year) {
      last.months.push(month);
      continue;
    }
    years.push({ year, months: [month] });
  }
  return years;
}

// The year Logs' entry opens on `today`: in December the year itself, in
// January the year before, otherwise none (docs/screens/records-timeline.md).
export function yearReviewYear(today: Date): number | null {
  if (today.getMonth() === 11) return today.getFullYear();
  if (today.getMonth() === 0) return today.getFullYear() - 1;
  return null;
}
