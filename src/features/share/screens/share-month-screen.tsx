import { useCloseWhenMissing } from "@/shared/hooks/use-close-when-missing";
import { useMonthStamps } from "@/shared/hooks/use-stamps";
import { buildMonthShare } from "@/shared/utils/month-share-grid";

import { MonthShareImage } from "../components/month-share-image";
import { ShareImageSheet } from "../components/share-image-sheet";
import { ShareRallyToggles } from "../components/share-rally-toggles";
import { useExcludedRallies } from "../hooks/use-excluded-rallies";
import { useRalliesInHomeOrder } from "../hooks/use-rallies-in-home-order";
import { stampedRallies } from "../utils/stamped-rallies";

type ShareMonthScreenProps = {
  // The month's first local day.
  month: Date;
};

// Shares one month as one image (docs/screens/share-image.md).
export function ShareMonthScreen({ month }: ShareMonthScreenProps) {
  const { data: stamps } = useMonthStamps(month);
  const rallies = useRalliesInHomeOrder();
  const { excludedIds, toggleRally } = useExcludedRallies();

  // A month without stamps has nothing to share.
  useCloseWhenMissing(stamps?.length === 0);

  if (!stamps || stamps.length === 0 || !rallies) return null;

  const share = buildMonthShare(
    month,
    stamps,
    rallies.filter((rally) => !excludedIds.has(rally.id)),
  );

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
        rallies={stampedRallies(stamps, rallies)}
        excludedIds={excludedIds}
        onToggle={toggleRally}
      />
    </ShareImageSheet>
  );
}
