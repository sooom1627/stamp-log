import { type Rally } from "@/shared/schemas/rallies";
import { compareStampsByTime, type Stamp } from "@/shared/schemas/stamps";
import { localDateKeyFromIso } from "@/shared/utils/local-date-key";
import { type DayMark } from "@/shared/utils/month-grid";

// Marks keyed by local YYYY-MM-DD for days with stamps of loaded rallies.
export function buildDayMarks(
  stamps: Stamp[],
  rallies: Rally[],
): Map<string, DayMark> {
  const emojiByRallyId = new Map(
    rallies.map((rally) => [rally.id, rally.emoji]),
  );
  const days = new Map<string, { last: Stamp; count: number }>();

  for (const stamp of stamps) {
    if (!emojiByRallyId.has(stamp.rallyId)) continue;
    const key = localDateKeyFromIso(stamp.stampedAt);
    const day = days.get(key);
    if (!day) {
      days.set(key, { last: stamp, count: 1 });
      continue;
    }
    day.count += 1;
    if (compareStampsByTime(stamp, day.last) > 0) day.last = stamp;
  }

  return new Map(
    Array.from(days, ([key, { last, count }]) => [
      key,
      { emoji: emojiByRallyId.get(last.rallyId) ?? "", extraCount: count - 1 },
    ]),
  );
}
