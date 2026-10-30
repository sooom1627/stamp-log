import { useState } from "react";

import {
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import { useTranslation } from "react-i18next";

import { type Rally } from "@/shared/schemas/rallies";

import { type TodayLogEntry } from "../utils/today-log";

import { TodayCard } from "./today-card";
import { TodayLogCard } from "./today-log-card";
import { WithAtoCard } from "./with-ato-card";

// Matches the tab root's px-5 and the row's gap-2.5.
const SCREEN_PADDING = 20;
const CARD_GAP = 10;
const CARD_COUNT = 3;

type HomeTopCardsProps = {
  windowWidth: number;
  today: Date;
  todayRallies: Rally[];
  todayLog: TodayLogEntry[];
  daysWithAto: number;
  firstStampedAt: Date | null;
  stampCount: number;
  // Every rally made, in home's tile order, archived ones after.
  allRallies: Rally[];
};

// Home's top cards (S-050), one card wide, swiped one at a time: today,
// today's log and With Ato. The dots below mark the card in view.
export function HomeTopCards({
  windowWidth,
  today,
  todayRallies,
  todayLog,
  daysWithAto,
  firstStampedAt,
  stampCount,
  allRallies,
}: HomeTopCardsProps) {
  const cardWidth = windowWidth - SCREEN_PADDING * 2;
  const [pageIndex, setPageIndex] = useState(0);
  const { t } = useTranslation();
  const positionOf = (index: number) =>
    t("home.position", { n: index + 1, total: CARD_COUNT });

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / (cardWidth + CARD_GAP),
    );
    setPageIndex(Math.min(Math.max(index, 0), CARD_COUNT - 1));
  };

  return (
    <View className="mb-5">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + CARD_GAP}
        decelerationRate="fast"
        disableIntervalMomentum
        onScroll={onScroll}
        scrollEventThrottle={16}
        className="-mx-5"
        contentContainerClassName="gap-2.5 px-5"
        testID="top-cards"
      >
        <TodayCard
          rallies={todayRallies}
          today={today}
          width={cardWidth}
          position={positionOf(0)}
        />
        <TodayLogCard
          entries={todayLog}
          width={cardWidth}
          position={positionOf(1)}
        />
        <WithAtoCard
          days={daysWithAto}
          firstStampedAt={firstStampedAt}
          stampCount={stampCount}
          rallies={allRallies}
          width={cardWidth}
          position={positionOf(2)}
        />
      </ScrollView>
      <View className="mt-3 flex-row justify-center gap-1.5" aria-hidden>
        {Array.from({ length: CARD_COUNT }, (_, index) => (
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
