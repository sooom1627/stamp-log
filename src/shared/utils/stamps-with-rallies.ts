import { type Rally } from "@/shared/schemas/rallies";
import { type Stamp } from "@/shared/schemas/stamps";

// Each stamp with its rally; stamps whose rally is not loaded are left out.
export function stampsWithRallies(stamps: Stamp[], rallies: Rally[]) {
  return stamps.flatMap((stamp) => {
    const rally = rallies.find((candidate) => candidate.id === stamp.rallyId);
    return rally ? [{ stamp, rally }] : [];
  });
}
