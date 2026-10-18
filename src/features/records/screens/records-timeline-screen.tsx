import { useState } from "react";

import { FlatList, Text, View } from "react-native";

import { useRouter } from "expo-router";

import { GestureDetector } from "react-native-gesture-handler";

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
import {
  albumTiles,
  type AlbumTile,
} from "@/features/rallies/utils/album-photos";
import { LoadError } from "@/shared/components/load-error";
import {
  TabRootHeader,
  TabRootSubtitle,
} from "@/shared/components/tab-root-screen";
import { formatStampTime } from "@/shared/utils/format-stamp-date-time";
import { groupByLocalDay } from "@/shared/utils/group-by-local-day";
import { swipeBetween } from "@/shared/utils/swipe-between";

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
  const isAlbum = view === "album";
  // Only while the switch is shown: without stamps there is nothing to swipe to.
  const swipeViews = swipeBetween({
    testId: "logs-view-swipe",
    values: stampsViews,
    value: view,
    onChange: setView,
    isEnabled: posts.length > 0,
  });
  // One list for both views, so the calendar above keeps its state.
  const items: (
    | { kind: "row"; key: string; row: AlbumTile[] }
    | { kind: "day"; key: string; section: (typeof sections)[number] }
  )[] = isAlbum
    ? albumRows(tiles).map((row) => ({
        kind: "row",
        key: `row-${row[0].key}`,
        row,
      }))
    : sections.map((section) => ({
        kind: "day",
        key: section.dateKey,
        section,
      }));

  return (
    <>
      <GestureDetector gesture={swipeViews}>
        <FlatList
          aria-label="Logs timeline"
          className="bg-canvas flex-1"
          contentContainerClassName={
            isAlbum ? "gap-0.5 px-5 pb-32" : "gap-4 px-5 pb-32"
          }
          contentInsetAdjustmentBehavior="automatic"
          data={items}
          keyExtractor={({ key }) => key}
          renderItem={({ item }) => {
            if (item.kind === "row") {
              return <AlbumRow tiles={item.row} showsEmoji />;
            }
            const { dateKey, data } = item.section;
            return (
              <DayCard
                dateKey={dateKey}
                date={new Date(data[0].stamp.stampedAt)}
              >
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
            );
          }}
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
          }
          ListEmptyComponent={
            <TimelineEmpty
              isError={isError}
              isLoaded={isLoaded}
              message={isAlbum ? "No photos yet" : "No stamps yet"}
              onRetry={() => {
                void refetchStamps();
                void refetchRallies();
              }}
            />
          }
        />
      </GestureDetector>
      <TabRootHeader title="Logs" />
    </>
  );
}
