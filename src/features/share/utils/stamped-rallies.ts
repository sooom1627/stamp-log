import { type Rally } from "@/shared/schemas/rallies";
import { type Stamp } from "@/shared/schemas/stamps";

// The rallies with stamps among `stamps`, in the image's row order: most
// stamped first and, with the same count, in the order of `rallies`. The
// share sheet's rally tags follow it.
export function stampedRallies(stamps: Stamp[], rallies: Rally[]): Rally[] {
  const counts = new Map<Rally["id"], number>();
  for (const stamp of stamps) {
    counts.set(stamp.rallyId, (counts.get(stamp.rallyId) ?? 0) + 1);
  }
  // Array sort is stable, so rallies with the same count keep their order.
  return rallies
    .filter((rally) => counts.has(rally.id))
    .sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0));
}
