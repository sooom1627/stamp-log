import { useState } from "react";

import { ScrollView, View } from "react-native";

import { useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

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
import { currentMonth, monthRange } from "@/shared/utils/month-grid";
import { stampsWithRallies } from "@/shared/utils/stamps-with-rallies";

import { buildDayMarks } from "../utils/day-marks";

export function RecordsTimelineScreen() {
  const { push } = useRouter();
  const { t } = useTranslation();
  // Starts on Stamps every time the screen opens (not remembered).
  const [view, setView] = useState<StampsView>("stamps");
  // Opens on this month every time; the month is not remembered. The stamps
  // and the album below show only the calendar's month (S-051).
  const [month, setMonth] = useState(currentMonth);
  const { start, end } = monthRange(month);
  const { rallies, stamps, isLoaded, isError, retry } =
    useRalliesAndStamps(useStamps());
  const monthStamps = (stamps ?? []).filter((stamp) => {
    const stampedAt = new Date(stamp.stampedAt);
    return stampedAt >= start && stampedAt < end;
  });
  // A stamp is shown once its rally is loaded, so every post has its name.
  const posts = stampsWithRallies(monthStamps, rallies ?? []);
  const sections = groupByLocalDay(posts, ({ stamp }) => stamp.stampedAt);
  const tiles = albumTiles(monthStamps, rallies ?? []);
  const photoCount = tiles.reduce((sum, tile) => sum + tile.photoCount, 0);
  const hasPosts = posts.length > 0;
  // The calendar reads only the month it shows.
  const { data: calendarStamps } = useStampsBetween(start, end);
  const { data: firstStampedAt } = useFirstStampedAt();
  const calendarPosts = stampsWithRallies(calendarStamps ?? [], rallies ?? []);

  return (
    <>
      {/* Like a profile: the top and the switch scroll away with the pages,
          which still follow the finger (S-043 T-004). The switch only changes
          the pages, so it does not stick (S-050). The scroll runs under the
          large title so the title can shrink. */}
      <ScrollView
        aria-label={t("records.timelineLabel")}
        className="bg-canvas from-canvas-top via-canvas-mid to-canvas-bottom flex-1 bg-linear-to-b"
        contentContainerClassName="pb-32"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="px-5">
          <TabRootSubtitle>{t("records.subtitle")}</TabRootSubtitle>
          <RallyMonthCalendar
            testID="logs-calendar"
            month={month}
            onChangeMonth={setMonth}
            stampDates={calendarPosts.map(({ stamp }) => stamp.stampedAt)}
            dayMarks={buildDayMarks(calendarStamps ?? [], rallies ?? [])}
            firstStampedAt={firstStampedAt}
            isRecordedOnly
            onPressDay={(date) =>
              push({ pathname: "/logs-day", params: { date } })
            }
          />
        </View>
        {hasPosts ? (
          <View testID="logs-view-switch">
            {/* See-through so the screen's gradient shows; only the switch
                itself has a fill. */}
            <View className="px-5 pt-6 pb-2" testID="logs-view-switch-band">
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
            message={t("rallies.noStamps")}
            onRetry={retry}
          />
        )}
      </ScrollView>
      <TabRootHeader title={t("records.title")} />
    </>
  );
}
