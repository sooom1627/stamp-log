import { useState } from "react";

import {
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import { useTranslation } from "react-i18next";

import { type Rally } from "@/shared/schemas/rallies";
import { type MonthShare } from "@/shared/utils/month-share-grid";

import { type TodayLogEntry } from "../utils/today-log";

import { LastMonthCard } from "./last-month-card";
import { TodayCard } from "./today-card";
import { TodayLogCard } from "./today-log-card";
import { WithAtoCard } from "./with-ato-card";

// Matches the tab root's px-5 and the row's gap-3.
const SCREEN_PADDING = 20;
const CARD_GAP = 12;

type HomeTopCardsProps = {
  windowWidth: number;
  today: Date;
  todayRallies: Rally[];
  // Rallies stamped from home's tiles while it has been in view.
  pressedRallyIds: ReadonlySet<Rally["id"]>;
  todayLog: TodayLogEntry[];
  daysWithAto: number;
  firstStampedAt: Date | null;
  stampCount: number;
  // Every rally made, in home's tile order, archived ones after.
  allRallies: Rally[];
  // Last month, in the first days of a month with stamps then (S-058).
  lastMonth: { month: Date; share: MonthShare } | null;
};

// Home's top cards (S-050), one card wide, swiped one at a time: today,
// today's log and With Ato. The dots below mark the card in view.
export function HomeTopCards({
  windowWidth,
  today,
  todayRallies,
  pressedRallyIds,
  todayLog,
  daysWithAto,
  firstStampedAt,
  stampCount,
  allRallies,
  lastMonth,
}: HomeTopCardsProps) {
  // Today, last month (only some days), today's log, With Ato.
  const cardCount = lastMonth ? 4 : 3;
  // Cards after last month move one place along while it is shown.
  const shift = lastMonth ? 1 : 0;
  const cardWidth = windowWidth - SCREEN_PADDING * 2;
  const [pageIndex, setPageIndex] = useState(0);
  const { t } = useTranslation();
  const positionOf = (index: number) =>
    t("home.position", { n: index + 1, total: cardCount });

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / (cardWidth + CARD_GAP),
    );
    setPageIndex(Math.min(Math.max(index, 0), cardCount - 1));
  };

  return (
    <View className="mb-6">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + CARD_GAP}
        decelerationRate="fast"
        disableIntervalMomentum
        onScroll={onScroll}
        scrollEventThrottle={16}
        className="-mx-5"
        contentContainerClassName="gap-3 px-5"
        testID="top-cards"
      >
        <TodayCard
          rallies={todayRallies}
          pressedRallyIds={pressedRallyIds}
          today={today}
          width={cardWidth}
          position={positionOf(0)}
        />
        {lastMonth ? (
          <LastMonthCard
            month={lastMonth.month}
            share={lastMonth.share}
            width={cardWidth}
            position={positionOf(1)}
          />
        ) : null}
        <TodayLogCard
          entries={todayLog}
          width={cardWidth}
          position={positionOf(1 + shift)}
        />
        <WithAtoCard
          days={daysWithAto}
          firstStampedAt={firstStampedAt}
          stampCount={stampCount}
          rallies={allRallies}
          width={cardWidth}
          position={positionOf(2 + shift)}
        />
      </ScrollView>
      <View className="mt-3 flex-row justify-center gap-2" aria-hidden>
        {Array.from({ length: cardCount }, (_, index) => (
          <View
            key={index}
            className={
              index === pageIndex
                ? "bg-foreground h-1.5 w-4 rounded-full"
                : "bg-border size-1.5 rounded-full"
            }
            testID="top-card-dot"
          />
        ))}
      </View>
    </View>
  );
}
