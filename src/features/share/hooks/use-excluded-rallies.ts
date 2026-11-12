import { useState } from "react";

import { type Rally } from "@/shared/schemas/rallies";

// The rallies turned off in a share sheet. Not remembered: each sheet starts
// with every rally on.
export function useExcludedRallies() {
  const [excludedIds, setExcludedIds] = useState<ReadonlySet<Rally["id"]>>(
    new Set(),
  );
  const toggleRally = (rallyId: Rally["id"]) =>
    setExcludedIds((excluded) => {
      const next = new Set(excluded);
      if (!next.delete(rallyId)) next.add(rallyId);
      return next;
    });
  return { excludedIds, toggleRally };
}
