import { useState } from "react";

import { useCloseWhenMissing } from "@/shared/hooks/use-close-when-missing";
import { useRallies } from "@/shared/hooks/use-rallies";
import { useMonthStamps, useStampSummary } from "@/shared/hooks/use-stamps";
import { useToday } from "@/shared/hooks/use-today";
import { type Rally } from "@/shared/schemas/rallies";
import { buildMonthShare } from "@/shared/utils/month-share-grid";
import { sortRalliesForHome } from "@/shared/utils/sort-rallies-for-home";

import { MonthShareImage } from "../components/month-share-image";
import { ShareImageSheet } from "../components/share-image-sheet";
import { ShareRallyToggles } from "../components/share-rally-toggles";

type ShareMonthScreenProps = {
  // The month's first local day.
  month: Date;
};

// Shares one month as one image (docs/screens/share-image.md).
export function ShareMonthScreen({ month }: ShareMonthScreenProps) {
  const { data: stamps } = useMonthStamps(month);
  const { data: rallies } = useRallies();
  // Rows with the same count follow home's tiles, which sort by all-time counts.
  const { data: summary } = useStampSummary(useToday());
  // Rallies left out of the image. Not remembered: every rally starts on.
  const [excludedIds, setExcludedIds] = useState<ReadonlySet<Rally["id"]>>(
    new Set(),
  );

  // A month without stamps has nothing to share.
  useCloseWhenMissing(stamps?.length === 0);

  if (!stamps || stamps.length === 0 || !rallies || !summary) return null;

  // Home's order: its tiles first, then archived rallies (as home's card).
  const ralliesInHomeOrder = [
    ...sortRalliesForHome(
      rallies.filter((rally) => !rally.isArchived),
      summary.countsByRally,
    ),
    ...rallies.filter((rally) => rally.isArchived),
  ];
  const countsByRally = new Map<Rally["id"], number>();
  for (const stamp of stamps) {
    countsByRally.set(
      stamp.rallyId,
      (countsByRally.get(stamp.rallyId) ?? 0) + 1,
    );
  }
  // The rows' order: most stamped first (a stable sort keeps home's order).
  const stampedRallies = ralliesInHomeOrder
    .filter((rally) => countsByRally.has(rally.id))
    .sort(
      (a, b) => (countsByRally.get(b.id) ?? 0) - (countsByRally.get(a.id) ?? 0),
    );
  const share = buildMonthShare(
    month,
    stamps,
    ralliesInHomeOrder.filter((rally) => !excludedIds.has(rally.id)),
  );
  const toggleRally = (rallyId: Rally["id"]) =>
    setExcludedIds((excluded) => {
      const next = new Set(excluded);
      if (!next.delete(rallyId)) next.add(rallyId);
      return next;
    });

  return (
    <ShareImageSheet
      testID="share-month-sheet"
      eyebrow={String(month.getFullYear())}
      renderImage={(ref) => (
        <MonthShareImage ref={ref} month={month} share={share} />
      )}
      isShareDisabled={share.stampCount === 0}
    >
      <ShareRallyToggles
        rallies={stampedRallies}
        excludedIds={excludedIds}
        onToggle={toggleRally}
      />
    </ShareImageSheet>
  );
}
