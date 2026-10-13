import { FlatList, Text, View } from "react-native";

import { useRouter } from "expo-router";

import { DayCard } from "@/features/rallies/components/day-card";
import { RallyMonthCalendar } from "@/features/rallies/components/rally-month-calendar";
import { StampPost } from "@/features/rallies/components/stamp-post";
import { useRallies } from "@/features/rallies/hooks/use-rallies";
import { useStamps } from "@/features/rallies/hooks/use-stamps";
import { LoadError } from "@/shared/components/load-error";
import {
  TabRootHeader,
  TabRootSubtitle,
} from "@/shared/components/tab-root-screen";
import { formatStampTime } from "@/shared/utils/format-stamp-date-time";
import { groupByLocalDay } from "@/shared/utils/group-by-local-day";

import { buildDayMarks } from "../utils/day-marks";

type TimelineEmptyProps = {
  isError: boolean;
  isLoaded: boolean;
  onRetry: () => void;
};

// Nothing while loading, so No stamps yet never flashes before the posts.
function TimelineEmpty({ isError, isLoaded, onRetry }: TimelineEmptyProps) {
  if (isError) return <LoadError onRetry={onRetry} />;
  if (!isLoaded) return null;

  return (
    <View className="items-center py-12">
      <Text className="text-foreground-secondary">No stamps yet</Text>
    </View>
  );
}

export function RecordsTimelineScreen() {
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
  const isLoaded = stamps !== undefined && rallies !== undefined;
  const isError = isStampsError || isRalliesError;
  // A stamp is shown once its rally is loaded, so every post has its name.
  const posts = rallies
    ? (stamps ?? []).flatMap((stamp) => {
        const rally = rallies.find(
          (candidate) => candidate.id === stamp.rallyId,
        );
        return rally ? [{ stamp, rally }] : [];
      })
    : [];
  const sections = groupByLocalDay(posts, ({ stamp }) => stamp.stampedAt);

  return (
    <>
      <FlatList
        aria-label="Logs timeline"
        className="bg-canvas flex-1"
        contentContainerClassName="gap-4 px-5 pb-32"
        contentInsetAdjustmentBehavior="automatic"
        data={sections}
        keyExtractor={({ dateKey }) => dateKey}
        renderItem={({ item: { dateKey, data } }) => (
          <DayCard dateKey={dateKey} date={new Date(data[0].stamp.stampedAt)}>
            {data.map(({ stamp, rally }) => (
              <StampPost
                key={stamp.id}
                stamp={stamp}
                emoji={rally.emoji}
                title={rally.name}
                detail={formatStampTime(new Date(stamp.stampedAt))}
                onPress={() =>
                  push({
                    pathname: "/records/rallies/[id]",
                    params: { id: rally.id },
                  })
                }
              />
            ))}
          </DayCard>
        )}
        ListHeaderComponent={
          <View>
            <TabRootSubtitle>Your days, one stamp at a time</TabRootSubtitle>
            {/* Not linked to the list: moving it leaves the posts as they are. */}
            <RallyMonthCalendar
              testID="logs-calendar"
              stampDates={posts.map(({ stamp }) => stamp.stampedAt)}
              dayMarks={buildDayMarks(stamps ?? [], rallies ?? [])}
              isRecordedOnly
              onPressDay={(date) =>
                push({ pathname: "/logs-day", params: { date } })
              }
            />
            {posts.length > 0 ? (
              <View className="mt-6 flex-row items-baseline justify-between">
                <Text
                  role="heading"
                  className="text-foreground text-xl font-bold"
                >
                  Stamps
                </Text>
                <Text
                  aria-label={`${posts.length} stamps in the timeline`}
                  className="text-foreground-muted text-base"
                >
                  {posts.length}
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <TimelineEmpty
            isError={isError}
            isLoaded={isLoaded}
            onRetry={() => {
              void refetchStamps();
              void refetchRallies();
            }}
          />
        }
      />
      <TabRootHeader title="Logs" />
    </>
  );
}
