import { useCloseWhenMissing } from "@/shared/hooks/use-close-when-missing";
import { useRally } from "@/shared/hooks/use-rallies";
import { useRallyStamps } from "@/shared/hooks/use-stamps";

import { RallyShareImage } from "../components/rally-share-image";
import { ShareImageSheet } from "../components/share-image-sheet";

type ShareRallyScreenProps = {
  rallyId: number;
};

// Shares the whole rally as one image (docs/screens/share-image.md).
export function ShareRallyScreen({ rallyId }: ShareRallyScreenProps) {
  const { data: rally } = useRally(rallyId);
  const { data: stamps } = useRallyStamps(rallyId);

  // A missing rally, or one with no stamps left, has nothing to share.
  useCloseWhenMissing(rally === null || stamps?.length === 0);

  if (!rally || !stamps || stamps.length === 0) return null;

  return (
    <ShareImageSheet
      testID="share-rally-sheet"
      eyebrow={`${rally.emoji} ${rally.name}`}
      renderImage={(ref) => (
        <RallyShareImage
          ref={ref}
          rally={rally}
          stampedAts={stamps.map(({ stampedAt }) => stampedAt)}
        />
      )}
    />
  );
}
