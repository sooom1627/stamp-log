import { type Rally } from "@/features/rallies/schemas/rallies";
import { type Stamp } from "@/features/rallies/schemas/stamps";
import { type DayMark } from "@/features/rallies/utils/month-grid";
import { localDateKeyFromIso } from "@/shared/utils/local-date-key";

// Same order as listStamps: later stampedAt first, then the higher id.
function isLater(stamp: Stamp, than: Stamp) {
  if (stamp.stampedAt !== than.stampedAt) {
    return Date.parse(stamp.stampedAt) > Date.parse(than.stampedAt);
  }
  return stamp.id > than.id;
}

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
    if (isLater(stamp, day.last)) day.last = stamp;
  }

  return new Map(
    Array.from(days, ([key, { last, count }]) => [
      key,
      { emoji: emojiByRallyId.get(last.rallyId) ?? "", extraCount: count - 1 },
    ]),
  );
}
