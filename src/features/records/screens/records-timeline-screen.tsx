import { useState } from "react";

import { ScrollView, Text, useWindowDimensions, View } from "react-native";

import { useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";

import { AlbumGrid } from "@/features/rallies/components/album-grid";
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
import { stampsWithRallies } from "@/features/rallies/utils/stamps-with-rallies";
import { SwipePages } from "@/shared/components/swipe-pages";
import {
  TabRootHeader,
  TabRootSubtitle,
} from "@/shared/components/tab-root-screen";
import { TimelineEmpty } from "@/shared/components/timeline-empty";
import { formatStampTime } from "@/shared/utils/format-stamp-date-time";
import { groupByLocalDay } from "@/shared/utils/group-by-local-day";

import { buildDayMarks } from "../utils/day-marks";

export function RecordsTimelineScreen() {
  const { push } = useRouter();
  const headerHeight = useHeaderHeight();
  const { height: windowHeight } = useWindowDimensions();
  // Starts on Stamps every time the screen opens (not remembered).
  const [view, setView] = useState<StampsView>("stamps");
  // Each page's measured height; the pager takes the shown page's.
  const [pageHeights, setPageHeights] = useState<Record<StampsView, number>>({
    stamps: 0,
    album: 0,
  });
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
  const posts = stampsWithRallies(stamps ?? [], rallies ?? []);
  const sections = groupByLocalDay(posts, ({ stamp }) => stamp.stampedAt);
  const tiles = albumTiles(stamps ?? [], rallies ?? []);
  const photoCount = tiles.reduce((sum, tile) => sum + tile.photoCount, 0);
  const hasPosts = posts.length > 0;

  return (
    <>
      {/* Like a profile: the top scrolls away and the switch sticks, while
          the pages below still follow the finger (S-043 T-004). The scroll
          runs under the large title so the title can shrink. */}
      <ScrollView
        aria-label="Logs timeline"
        className="bg-canvas flex-1"
        contentContainerClassName="pb-32"
        contentInsetAdjustmentBehavior="automatic"
        stickyHeaderIndices={hasPosts ? [1] : undefined}
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
        </View>
        {hasPosts ? (
          // A sticky header stops at the scroll's top edge, which is under
          // the header, so reach up by the header's height (see-through
          // and letting touches pass) to stop the switch below it.
          <View
            testID="logs-view-switch"
            style={{
              marginTop: -headerHeight,
              paddingTop: headerHeight,
              pointerEvents: "box-none",
            }}
          >
            <View className="bg-canvas px-5 pt-6 pb-2">
              <StampsAlbumPicker
                testID="logs-view-picker"
                view={view}
                stampCount={posts.length}
                photoCount={photoCount}
                onChangeView={setView}
              />
            </View>
          </View>
        ) : null}
        {hasPosts ? (
          <SwipePages
            testID="logs-view-pager"
            values={stampsViews}
            value={view}
            onChange={setView}
            // Zero until measured would hide the pages (and keep them from
            // being measured), so start a screen tall.
            height={pageHeights[view] || windowHeight}
            renderPage={(page) => (
              // The page fills the pager; this measures what it holds.
              <View
                testID={`logs-view-page-${page}`}
                className="px-5 pt-2"
                onLayout={({ nativeEvent: { layout } }) =>
                  setPageHeights((heights) => ({
                    ...heights,
                    [page]: layout.height,
                  }))
                }
              >
                {page === "stamps" ? (
                  <View className="gap-4">
                    {sections.map((section) => (
                      <DayCard
                        key={section.dateKey}
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
                    ))}
                  </View>
                ) : tiles.length === 0 ? (
                  <View className="items-center py-12">
                    <Text className="text-foreground-secondary">
                      No photos yet
                    </Text>
                  </View>
                ) : (
                  <AlbumGrid tiles={tiles} showsEmoji />
                )}
              </View>
            )}
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
      </ScrollView>
      <TabRootHeader title="Logs" />
    </>
  );
}
