import { useState } from "react";

import { ScrollView, View } from "react-native";

import { useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";

import { DayCard } from "@/shared/components/day-card";
import { RallyMonthCalendar } from "@/shared/components/rally-month-calendar";
import { StampPost } from "@/shared/components/stamp-post";
import { StampsAlbumPager } from "@/shared/components/stamps-album-pager";
import {
  StampsAlbumPicker,
  type StampsView,
} from "@/shared/components/stamps-album-picker";
import {
  TabRootHeader,
  TabRootSubtitle,
} from "@/shared/components/tab-root-screen";
import { TimelineEmpty } from "@/shared/components/timeline-empty";
import { useRalliesAndStamps } from "@/shared/hooks/use-rallies-and-stamps";
import {
  useFirstStampedAt,
  useStamps,
  useStampsBetween,
} from "@/shared/hooks/use-stamps";
import { albumTiles } from "@/shared/utils/album-photos";
import { formatStampTime } from "@/shared/utils/format-stamp-date-time";
import { groupByLocalDay } from "@/shared/utils/group-by-local-day";
import { initialCalendarRange } from "@/shared/utils/month-grid";
import { stampsWithRallies } from "@/shared/utils/stamps-with-rallies";

import { buildDayMarks } from "../utils/day-marks";

export function RecordsTimelineScreen() {
  const { push } = useRouter();
  const headerHeight = useHeaderHeight();
  // Starts on Stamps every time the screen opens (not remembered).
  const [view, setView] = useState<StampsView>("stamps");
  const { rallies, stamps, isLoaded, isError, retry } =
    useRalliesAndStamps(useStamps());
  // A stamp is shown once its rally is loaded, so every post has its name.
  const posts = stampsWithRallies(stamps ?? [], rallies ?? []);
  const sections = groupByLocalDay(posts, ({ stamp }) => stamp.stampedAt);
  const tiles = albumTiles(stamps ?? [], rallies ?? []);
  const photoCount = tiles.reduce((sum, tile) => sum + tile.photoCount, 0);
  const hasPosts = posts.length > 0;
  // The calendar reads only the week or month it shows.
  const [calendarRange, setCalendarRange] = useState(initialCalendarRange);
  const { data: calendarStamps } = useStampsBetween(
    calendarRange.start,
    calendarRange.end,
  );
  const { data: firstStampedAt } = useFirstStampedAt();
  const calendarPosts = stampsWithRallies(calendarStamps ?? [], rallies ?? []);

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
            stampDates={calendarPosts.map(({ stamp }) => stamp.stampedAt)}
            dayMarks={buildDayMarks(calendarStamps ?? [], rallies ?? [])}
            firstStampedAt={firstStampedAt}
            onVisibleRangeChange={setCalendarRange}
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
          <StampsAlbumPager
            testIDPrefix="logs-view"
            view={view}
            onChangeView={setView}
            pageClassName="px-5 pt-2"
            stamps={
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
            }
            tiles={tiles}
            showsEmoji
          />
        ) : (
          <TimelineEmpty
            isError={isError}
            isLoaded={isLoaded}
            message="No stamps yet"
            onRetry={retry}
          />
        )}
      </ScrollView>
      <TabRootHeader title="Logs" />
    </>
  );
}
