import { type Rally } from "../schemas/rallies";
import { type Stamp } from "../schemas/stamps";

export function stampDatesForRally(stamps: Stamp[], rallyId: Rally["id"]) {
  return stamps
    .filter((stamp) => stamp.rallyId === rallyId)
    .map((stamp) => stamp.stampedAt);
}
