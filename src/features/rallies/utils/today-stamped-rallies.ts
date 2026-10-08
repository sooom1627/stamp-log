import {
  localDateKey,
  localDateKeyFromIso,
} from "@/shared/utils/local-date-key";

import { type Rally } from "../schemas/rallies";
import { type Stamp } from "../schemas/stamps";

// Rallies stamped on today's local date, once each, first stamped first.
// Stamps of rallies that are not in the list are ignored.
export function buildTodayStampedRallies(
  stamps: Stamp[],
  rallies: Rally[],
  today: Date,
): Rally[] {
  const todayKey = localDateKey(today);
  const ralliesById = new Map(rallies.map((rally) => [rally.id, rally]));
  const todayRallyIds = new Set(
    stamps
      .filter((stamp) => localDateKeyFromIso(stamp.stampedAt) === todayKey)
      .sort((a, b) => Date.parse(a.stampedAt) - Date.parse(b.stampedAt))
      .map((stamp) => stamp.rallyId),
  );

  return [...todayRallyIds].flatMap((rallyId) => {
    const rally = ralliesById.get(rallyId);
    return rally ? [rally] : [];
  });
}
