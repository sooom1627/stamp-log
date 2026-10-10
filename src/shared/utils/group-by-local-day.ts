import { localDateKeyFromIso } from "./local-date-key";

export type DaySection<T> = { dateKey: string; data: T[] };

// Sections per local YYYY-MM-DD in input order. Expects items sorted by time,
// so each day forms one run.
export function groupByLocalDay<T>(
  items: T[],
  getIso: (item: T) => string,
): DaySection<T>[] {
  const sections: DaySection<T>[] = [];
  for (const item of items) {
    const dateKey = localDateKeyFromIso(getIso(item));
    const last = sections.at(-1);
    if (last?.dateKey === dateKey) {
      last.data.push(item);
      continue;
    }
    sections.push({ dateKey, data: [item] });
  }
  return sections;
}
