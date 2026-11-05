import { useDeferredValue, useRef, useState } from "react";

import { View, type ScrollViewInstance } from "react-native";

import { useRouter } from "expo-router";

import { useTranslation } from "react-i18next";
import Animated, { cubicBezier } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RallyMonthCalendar } from "@/shared/components/rally-month-calendar";
import { type StampsView } from "@/shared/components/stamps-album-picker";
import {
  TabRootHeader,
  TabRootSubtitle,
} from "@/shared/components/tab-root-screen";
import { TabScrollView } from "@/shared/components/tab-scroll-view";
import { useRallies } from "@/shared/hooks/use-rallies";
import { useFirstStampedAt, useMonthStamps } from "@/shared/hooks/use-stamps";
import { currentMonth } from "@/shared/utils/month-grid";
import { stampsWithRallies } from "@/shared/utils/stamps-with-rallies";

import { LogsMonthStamps } from "../components/logs-month-stamps";
import { buildDayMarks } from "../utils/day-marks";

// The navigation bar once the large title has shrunk (iOS).
const COLLAPSED_BAR_HEIGHT = 44;
// While the stamps below still show the month before, they fade nearly out,
// and back in once the new month is drawn. The wait keeps a quick turn from
// dimming at all (as in React's useDeferredValue "stale content" example).
const STALE_OPACITY = 0.1;
const STALE_DELAY_MS = 100;
const FADE_MS = 200;
const FADE_EASING = cubicBezier(0.23, 1, 0.32, 1);

export function RecordsTimelineScreen() {
  const { push } = useRouter();
  const { t } = useTranslation();
  // Starts on Stamps every time the screen opens (not remembered).
  const [view, setView] = useState<StampsView>("stamps");
  // Opens on this month every time; the month is not remembered. The stamps
  // and the album below show only the calendar's month (S-051).
  const [month, setMonth] = useState(currentMonth);
  // The calendar turns at once; the stamps below follow when React has time.
  // Mounting a month of posts takes long, so a swipe or ‹ › does not wait for
  // it, and quick turns skip the months passed on the way.
  const listMonth = useDeferredValue(month);
  const isListStale = listMonth !== month;
  const { top: safeTop } = useSafeAreaInsets();
  const scrollRef = useRef<ScrollViewInstance>(null);
  // Where the month heading sits in the scroll.
  const monthY = useRef(0);
  // The calendar's pages beside the shown month come into view while it is
  // swiped. Each month is read once, so a turn reads only the month newly
  // beside it, and the months already read keep their data.
  const { data: previousStamps } = useMonthStamps(
    new Date(month.getFullYear(), month.getMonth() - 1, 1),
  );
  const { data: shownStamps } = useMonthStamps(month);
  const { data: nextStamps } = useMonthStamps(
    new Date(month.getFullYear(), month.getMonth() + 1, 1),
  );
  const { data: rallies } = useRallies();
  const { data: firstStampedAt } = useFirstStampedAt();
  const calendarStamps = [
    ...(previousStamps ?? []),
    ...(shownStamps ?? []),
    ...(nextStamps ?? []),
  ];
  const calendarPosts = stampsWithRallies(calendarStamps, rallies ?? []);

  const showMonth = (shown: Date) => {
    setMonth(shown);
    // Read the new month from its heading, just under the shrunk bar.
    scrollRef.current?.scrollTo({
      y: monthY.current - safeTop - COLLAPSED_BAR_HEIGHT,
      animated: true,
    });
  };

  return (
    <>
      {/* Like a profile: the top and the switch scroll away with the pages,
          which still follow the finger (S-043 T-004). The switch only changes
          the pages, so it does not stick (S-050). The scroll runs under the
          large title so the title can shrink. */}
      <TabScrollView
        ref={scrollRef}
        aria-label={t("records.timelineLabel")}
        className="bg-canvas from-canvas-top via-canvas-mid to-canvas-bottom flex-1 bg-linear-to-b"
      >
        <View className="px-5">
          <TabRootSubtitle>{t("records.subtitle")}</TabRootSubtitle>
          <View
            testID="logs-month"
            onLayout={({ nativeEvent }) => {
              monthY.current = nativeEvent.layout.y;
            }}
          >
            <RallyMonthCalendar
              testID="logs-calendar"
              month={month}
              onChangeMonth={setMonth}
              stampDates={calendarPosts.map(({ stamp }) => stamp.stampedAt)}
              dayMarks={buildDayMarks(calendarStamps, rallies ?? [])}
              firstStampedAt={firstStampedAt}
              isRecordedOnly
              onPressDay={(date) =>
                push({ pathname: "/logs-day", params: { date } })
              }
            />
          </View>
        </View>
        <Animated.View
          testID="logs-month-stamps"
          style={{
            opacity: isListStale ? STALE_OPACITY : 1,
            transitionProperty: "opacity",
            transitionDuration: FADE_MS,
            transitionDelay: isListStale ? STALE_DELAY_MS : 0,
            transitionTimingFunction: FADE_EASING,
          }}
        >
          <LogsMonthStamps
            month={listMonth}
            view={view}
            onChangeView={setView}
            onShowMonth={showMonth}
          />
        </Animated.View>
      </TabScrollView>
      <TabRootHeader title={t("records.title")} />
    </>
  );
}
