import { useCloseWhenMissing } from "@/shared/hooks/use-close-when-missing";
import { useRallies } from "@/shared/hooks/use-rallies";
import { useMonthStamps, useStampSummary } from "@/shared/hooks/use-stamps";
import { useToday } from "@/shared/hooks/use-today";
import { buildMonthShare } from "@/shared/utils/month-share-grid";
import { sortRalliesForHome } from "@/shared/utils/sort-rallies-for-home";

import { MonthShareImage } from "../components/month-share-image";
import { ShareImageSheet } from "../components/share-image-sheet";

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
  const share = buildMonthShare(month, stamps, ralliesInHomeOrder);

  return (
    <ShareImageSheet
      testID="share-month-sheet"
      eyebrow={String(month.getFullYear())}
      renderImage={(ref) => (
        <MonthShareImage ref={ref} month={month} share={share} />
      )}
    />
  );
}
