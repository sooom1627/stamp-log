import { useRouter } from "expo-router";

import { StampPost } from "@/features/rallies/components/stamp-post";
import { useRallies } from "@/features/rallies/hooks/use-rallies";
import { useDeleteStamp, useStamps } from "@/features/rallies/hooks/use-stamps";
import { confirmDeleteStamp } from "@/features/rallies/utils/confirm-delete-stamp";
import { FormSheetLayout } from "@/shared/components/form-sheet";
import { LoadError } from "@/shared/components/load-error";
import { formatStampTime } from "@/shared/utils/format-stamp-date-time";
import {
  localDateKey,
  localDateKeyFromIso,
} from "@/shared/utils/local-date-key";

const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

type LogsDayScreenProps = {
  // Local midnight of the day to show.
  date: Date;
};

export function LogsDayScreen({ date }: LogsDayScreenProps) {
  const { push } = useRouter();
  const {
    data: stamps,
    isError: isStampsError,
    refetch: refetchStamps,
  } = useStamps();
  const {
    data: rallies,
    isError: isRalliesError,
    refetch: refetchRallies,
  } = useRallies();
  const { mutate: deleteStamp } = useDeleteStamp();

  const dayKey = localDateKey(date);
  // Newest first, as listStamps returns them. A stamp shows once its rally is
  // loaded, so every post has its name.
  const posts = (stamps ?? []).flatMap((stamp) => {
    if (localDateKeyFromIso(stamp.stampedAt) !== dayKey) return [];
    const rally = rallies?.find((candidate) => candidate.id === stamp.rallyId);
    return rally ? [{ stamp, rally }] : [];
  });

  return (
    <FormSheetLayout
      testID="logs-day-sheet"
      eyebrow={weekdayFormatter.format(date)}
      title={dateFormatter.format(date)}
    >
      {isStampsError || isRalliesError ? (
        <LoadError
          onRetry={() => {
            void refetchStamps();
            void refetchRallies();
          }}
        />
      ) : null}
      {posts.map(({ stamp, rally }) => (
        <StampPost
          key={stamp.id}
          id={stamp.id}
          emoji={rally.emoji}
          title={rally.name}
          detail={formatStampTime(new Date(stamp.stampedAt))}
          memo={stamp.memo}
          onEdit={(stampId) =>
            push({ pathname: "/edit-stamp", params: { stampId } })
          }
          onDelete={(stampId) => confirmDeleteStamp(() => deleteStamp(stampId))}
        />
      ))}
    </FormSheetLayout>
  );
}
