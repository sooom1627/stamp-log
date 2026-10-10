import { type Rally } from "../schemas/rallies";
import { type Stamp } from "../schemas/stamps";

// Favorites first; then the most stamped; with the same count, the newer
// rally (larger id) first.
export function sortRalliesForHome(rallies: Rally[], stamps: Stamp[]): Rally[] {
  const stampCounts = new Map<number, number>();
  for (const stamp of stamps) {
    stampCounts.set(stamp.rallyId, (stampCounts.get(stamp.rallyId) ?? 0) + 1);
  }
  const countOf = (rally: Rally) => stampCounts.get(rally.id) ?? 0;

  return [...rallies].sort(
    (a, b) =>
      Number(b.isFavorite) - Number(a.isFavorite) ||
      countOf(b) - countOf(a) ||
      b.id - a.id,
  );
}
