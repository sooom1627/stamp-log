import { type Rally } from "@/shared/schemas/rallies";

// Favorites first; then the most stamped; with the same count, the newer
// rally (larger id) first.
export function sortRalliesForHome(
  rallies: Rally[],
  countsByRally: ReadonlyMap<Rally["id"], number>,
): Rally[] {
  const countOf = (rally: Rally) => countsByRally.get(rally.id) ?? 0;

  return [...rallies].sort(
    (a, b) =>
      Number(b.isFavorite) - Number(a.isFavorite) ||
      countOf(b) - countOf(a) ||
      b.id - a.id,
  );
}
