import { localDateKey } from "@/shared/utils/local-date-key";

import { type Rally } from "../schemas/rallies";
import { type Stamp } from "../schemas/stamps";

export type StampedDay = {
  dateKey: string;
  date: Date;
  isToday: boolean;
  emojis: string[];
};

const DAY_COUNT = 14;

// Every day of the last 14 days (today included), newest first, with the
// emoji of each rally stamped that day. Days without stamps have no emojis.
export function buildStampedDays(
  stamps: Stamp[],
  rallies: Rally[],
  today: Date,
): StampedDay[] {
  const emojiByRallyId = new Map(
    rallies.map((rally) => [rally.id, rally.emoji]),
  );
  const oldestStampsFirst = [...stamps].sort(
    (a, b) => Date.parse(a.stampedAt) - Date.parse(b.stampedAt),
  );
  const days: StampedDay[] = [];

  for (let offset = 0; offset < DAY_COUNT; offset += 1) {
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - offset,
    );
    const dateKey = localDateKey(date);
    const rallyIds = new Set(
      oldestStampsFirst
        .filter(
          (stamp) =>
            emojiByRallyId.has(stamp.rallyId) &&
            localDateKey(new Date(stamp.stampedAt)) === dateKey,
        )
        .map((stamp) => stamp.rallyId),
    );
    days.push({
      dateKey,
      date,
      isToday: offset === 0,
      emojis: [...rallyIds].map((rallyId) => emojiByRallyId.get(rallyId)!),
    });
  }

  return days;
}
