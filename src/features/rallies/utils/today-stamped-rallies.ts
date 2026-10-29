import { type Rally } from "@/shared/schemas/rallies";
import { compareStampsByTime, type Stamp } from "@/shared/schemas/stamps";
import {
  localDateKey,
  localDateKeyFromIso,
} from "@/shared/utils/local-date-key";

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
      .sort(compareStampsByTime)
      .map((stamp) => stamp.rallyId),
  );

  return [...todayRallyIds].flatMap((rallyId) => {
    const rally = ralliesById.get(rallyId);
    return rally ? [rally] : [];
  });
}
