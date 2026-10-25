import { Text, View } from "react-native";

import { StampPost } from "@/features/rallies/components/stamp-post";
import { useRalliesAndStamps } from "@/features/rallies/hooks/use-rallies-and-stamps";
import { stampsWithRallies } from "@/features/rallies/utils/stamps-with-rallies";
import { FormSheetLayout } from "@/shared/components/form-sheet";
import { LoadError } from "@/shared/components/load-error";
import { formatHeaderDate } from "@/shared/utils/format-header-date";
import { formatMediumDate } from "@/shared/utils/format-medium-date";
import { formatStampTime } from "@/shared/utils/format-stamp-date-time";
import {
  localDateKey,
  localDateKeyFromIso,
} from "@/shared/utils/local-date-key";

type LogsDayScreenProps = {
  // Local midnight of the day to show.
  date: Date;
};

export function LogsDayScreen({ date }: LogsDayScreenProps) {
  const { rallies, stamps, isLoaded, isError, retry } = useRalliesAndStamps();
  const dayKey = localDateKey(date);
  // Newest first, as listStamps returns them. A stamp shows once its rally is
  // loaded, so every post has its name.
  const posts = stampsWithRallies(stamps ?? [], rallies ?? []).filter(
    ({ stamp }) => localDateKeyFromIso(stamp.stampedAt) === dayKey,
  );

  return (
    <FormSheetLayout
      testID="logs-day-sheet"
      scrollable
      eyebrow={formatHeaderDate(date).weekday}
      title={formatMediumDate(date)}
    >
      {isError ? <LoadError onRetry={retry} /> : null}
      {/* The calendar opens recorded days only, so this shows after deleting
          the day's last stamp. */}
      {isLoaded && !isError && posts.length === 0 ? (
        <View className="items-center py-8">
          <Text className="text-foreground-secondary">
            No stamps on this day
          </Text>
        </View>
      ) : null}
      {posts.map(({ stamp, rally }) => (
        <StampPost
          key={stamp.id}
          stamp={stamp}
          emoji={rally.emoji}
          title={rally.name}
          detail={formatStampTime(new Date(stamp.stampedAt))}
        />
      ))}
    </FormSheetLayout>
  );
}
