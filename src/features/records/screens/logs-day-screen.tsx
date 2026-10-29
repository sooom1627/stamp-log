import { Text, View } from "react-native";

import { FormSheetLayout } from "@/shared/components/form-sheet";
import { LoadError } from "@/shared/components/load-error";
import { StampPost } from "@/shared/components/stamp-post";
import { useRalliesAndStamps } from "@/shared/hooks/use-rallies-and-stamps";
import { useStampsBetween } from "@/shared/hooks/use-stamps";
import { addLocalDays } from "@/shared/utils/add-local-days";
import { formatHeaderDate } from "@/shared/utils/format-header-date";
import { formatMediumDate } from "@/shared/utils/format-medium-date";
import { formatStampTime } from "@/shared/utils/format-stamp-date-time";
import { stampsWithRallies } from "@/shared/utils/stamps-with-rallies";

type LogsDayScreenProps = {
  // Local midnight of the day to show.
  date: Date;
};

export function LogsDayScreen({ date }: LogsDayScreenProps) {
  // Only this local day's stamps, newest first.
  const { rallies, stamps, isLoaded, isError, retry } = useRalliesAndStamps(
    useStampsBetween(date, addLocalDays(date, 1)),
  );
  // A stamp shows once its rally is loaded, so every post has its name.
  const posts = stampsWithRallies(stamps ?? [], rallies ?? []);

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
