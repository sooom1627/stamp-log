import { type Rally } from "@/shared/schemas/rallies";
import { type Stamp } from "@/shared/schemas/stamps";

// Each rally's stampedAt in the stamps' order, in one pass over the stamps.
export function stampDatesByRally(stamps: Stamp[]) {
  const datesByRally = new Map<Rally["id"], Stamp["stampedAt"][]>();
  for (const { rallyId, stampedAt } of stamps) {
    const dates = datesByRally.get(rallyId);
    if (dates) dates.push(stampedAt);
    else datesByRally.set(rallyId, [stampedAt]);
  }
  return datesByRally;
}
