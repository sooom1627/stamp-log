import { useState } from "react";

import { FlatList, Text, View } from "react-native";

import { useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";

import { AlbumRow, albumRows } from "@/features/rallies/components/album-row";
import { DayCard } from "@/features/rallies/components/day-card";
import { RallyMonthCalendar } from "@/features/rallies/components/rally-month-calendar";
import { StampPost } from "@/features/rallies/components/stamp-post";
import {
  StampsAlbumPicker,
  stampsViews,
  type StampsView,
} from "@/features/rallies/components/stamps-album-picker";
import { useRallies } from "@/features/rallies/hooks/use-rallies";
import { useStamps } from "@/features/rallies/hooks/use-stamps";
import { albumTiles } from "@/features/rallies/utils/album-photos";
import { LoadError } from "@/shared/components/load-error";
import { SwipePages } from "@/shared/components/swipe-pages";
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
  message: string;
  onRetry: () => void;
};

// Nothing while loading, so No stamps yet never flashes before the posts.
function TimelineEmpty({
  isError,
  isLoaded,
  message,
  onRetry,
}: TimelineEmptyProps) {
  if (isError) return <LoadError onRetry={onRetry} />;
  if (!isLoaded) return null;

  return (
    <View className="items-center py-12">
      <Text className="text-foreground-secondary">{message}</Text>
    </View>
  );
}

export function RecordsTimelineScreen() {
  const { push } = useRouter();
  const headerHeight = useHeaderHeight();
  // Starts on Stamps every time the screen opens (not remembered).
  const [view, setView] = useState<StampsView>("stamps");
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
  const tiles = albumTiles(stamps ?? [], rallies ?? []);
  const photoCount = tiles.reduce((sum, tile) => sum + tile.photoCount, 0);

  return (
    <>
      {/* The large title header is translucent, so the fixed top starts below it. */}
      <View
        aria-label="Logs timeline"
        className="bg-canvas flex-1"
        style={{ paddingTop: headerHeight }}
      >
        <View className="px-5">
          <TabRootSubtitle>Your days, one stamp at a time</TabRootSubtitle>
          {/* Not linked to the pages: moving it leaves the posts as they are. */}
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
            <View className="mt-6 mb-2">
              <StampsAlbumPicker
                testID="logs-view-picker"
                view={view}
                stampCount={posts.length}
                photoCount={photoCount}
                onChangeView={setView}
              />
            </View>
          ) : null}
        </View>
        {posts.length > 0 ? (
          <SwipePages
            testID="logs-view-pager"
            values={stampsViews}
            value={view}
            onChange={setView}
            renderPage={(page) =>
              page === "stamps" ? (
                <FlatList
                  contentContainerClassName="gap-4 px-5 pt-2 pb-32"
                  contentInsetAdjustmentBehavior="automatic"
                  data={sections}
                  keyExtractor={({ dateKey }) => dateKey}
                  renderItem={({ item: section }) => (
                    <DayCard
                      dateKey={section.dateKey}
                      date={new Date(section.data[0].stamp.stampedAt)}
                    >
                      {section.data.map(({ stamp, rally }) => (
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
                />
              ) : (
                <FlatList
                  contentContainerClassName="gap-0.5 px-5 pt-2 pb-32"
                  contentInsetAdjustmentBehavior="automatic"
                  data={albumRows(tiles)}
                  keyExtractor={(row) => `row-${row[0].key}`}
                  renderItem={({ item: row }) => (
                    <AlbumRow tiles={row} showsEmoji />
                  )}
                  ListEmptyComponent={
                    <View className="items-center py-12">
                      <Text className="text-foreground-secondary">
                        No photos yet
                      </Text>
                    </View>
                  }
                />
              )
            }
          />
        ) : (
          <TimelineEmpty
            isError={isError}
            isLoaded={isLoaded}
            message="No stamps yet"
            onRetry={() => {
              void refetchStamps();
              void refetchRallies();
            }}
          />
        )}
      </View>
      <TabRootHeader title="Logs" />
    </>
  );
}
