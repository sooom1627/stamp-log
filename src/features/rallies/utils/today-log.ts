import { type Rally } from "@/shared/schemas/rallies";
import { compareStampsByTime, type Stamp } from "@/shared/schemas/stamps";
import { addLocalDays } from "@/shared/utils/add-local-days";
import {
  localDateKey,
  localDateKeyFromIso,
} from "@/shared/utils/local-date-key";

export type TodayLogEntry = {
  stampId: Stamp["id"];
  emoji: Rally["emoji"];
  stampedAt: Date;
  // 0 to 24, where the stamp sits on the day's line.
  hour: number;
};

// Every stamp of today's local date, oldest first, for today's log. Unlike
// the today card, a rally stamped twice is listed twice. Stamps of rallies
// that are not in the list are ignored.
export function buildTodayLog(
  stamps: Stamp[],
  rallies: Rally[],
  today: Date,
): TodayLogEntry[] {
  const todayKey = localDateKey(today);
  const emojiByRallyId = new Map(
    rallies.map((rally) => [rally.id, rally.emoji]),
  );

  return stamps
    .filter((stamp) => localDateKeyFromIso(stamp.stampedAt) === todayKey)
    .sort(compareStampsByTime)
    .flatMap((stamp) => {
      const emoji = emojiByRallyId.get(stamp.rallyId);
      if (emoji === undefined) return [];
      const stampedAt = new Date(stamp.stampedAt);
      const hour = stampedAt.getHours() + stampedAt.getMinutes() / 60;
      return [{ stampId: stamp.id, emoji, stampedAt, hour }];
    });
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Days from the first stamp's local day to today, counting that day as day
// 1 (With Ato). 0 without stamps.
export function countDaysWithAto(
  firstStampedAt: Stamp["stampedAt"] | null,
  today: Date,
) {
  if (firstStampedAt === null) return 0;
  const firstDay = addLocalDays(new Date(firstStampedAt), 0);
  const todayDay = addLocalDays(today, 0);
  // Rounded so a DST change (a 23 or 25 hour day) still counts as one day.
  return Math.round((todayDay.getTime() - firstDay.getTime()) / DAY_MS) + 1;
}
