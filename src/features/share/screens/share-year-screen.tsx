import { useCloseWhenMissing } from "@/shared/hooks/use-close-when-missing";
import { useStampsBetween } from "@/shared/hooks/use-stamps";

import { ShareImageSheet } from "../components/share-image-sheet";
import { ShareRallyToggles } from "../components/share-rally-toggles";
import { YearShareImage } from "../components/year-share-image";
import { useExcludedRallies } from "../hooks/use-excluded-rallies";
import { useRalliesInHomeOrder } from "../hooks/use-rallies-in-home-order";
import { stampedRallies } from "../utils/stamped-rallies";
import { buildYearShare } from "../utils/year-share";

type ShareYearScreenProps = {
  year: number;
  // The year review's page, 1 to 4.
  page: number;
};

// Shares one page of the year review as one image
// (docs/screens/share-image.md).
export function ShareYearScreen({ year, page }: ShareYearScreenProps) {
  const { data: stamps } = useStampsBetween(
    new Date(year, 0, 1),
    new Date(year + 1, 0, 1),
  );
  const rallies = useRalliesInHomeOrder();
  const { excludedIds, toggleRally } = useExcludedRallies();

  // A year without stamps has nothing to share.
  useCloseWhenMissing(stamps?.length === 0);

  if (!stamps || stamps.length === 0 || !rallies) return null;

  const share = buildYearShare(
    stamps,
    rallies.filter((rally) => !excludedIds.has(rally.id)),
  );

  return (
    <ShareImageSheet
      testID="share-year-sheet"
      eyebrow={String(year)}
      renderImage={(ref) => (
        <YearShareImage ref={ref} year={year} page={page} share={share} />
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
