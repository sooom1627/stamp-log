import { useState } from "react";

import { Pressable, Text, View } from "react-native";

import { useTranslation } from "react-i18next";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

import { monthNumber, useMonthSwipe } from "@/shared/hooks/use-month-swipe";
import { localDateKey } from "@/shared/utils/local-date-key";
import {
  currentMonth,
  formatMonthHeading,
  pickerYears,
  type DayMark,
} from "@/shared/utils/month-grid";

import { CalendarMonthPage } from "./calendar-month-page";
import { ChevronLeft, ChevronRight } from "./icons";
import { MonthPickerSheet } from "./month-picker-sheet";

// The pages around the shown month that are kept ready for a swipe.
const PAGE_OFFSETS = [-1, 0, 1];

function monthTestKey(month: Date) {
  return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
}

type RallyMonthCalendarProps = {
  testID?: string;
  stampDates: string[];
  // Shown on recorded days in place of the day number (one rally).
  emoji?: string;
  // Per-day emoji and extra count keyed by YYYY-MM-DD (every rally, on Logs).
  // Wins over `emoji`.
  dayMarks?: ReadonlyMap<string, DayMark>;
  // Called with the YYYY-MM-DD key of a day up to today. Without it no day
  // can be pressed.
  onPressDay?: (key: string) => void;
  // Logs opens only days with stamps; rally detail opens empty days too.
  isRecordedOnly?: boolean;
  // The shown month (its first local day). The screen keeps it, so it can
  // show that month's stamps below (Logs) and move it from elsewhere.
  month: Date;
  // Called with the first day of the month that ‹ ›, a swipe or the picker
  // moves to.
  onChangeMonth: (month: Date) => void;
  // The oldest stamp's time, when `stampDates` holds only the shown range.
  firstStampedAt?: string | null;
};

export function RallyMonthCalendar({
  testID = "rally-calendar",
  stampDates,
  emoji,
  dayMarks,
  onPressDay,
  isRecordedOnly = false,
  month,
  onChangeMonth,
  firstStampedAt,
}: RallyMonthCalendarProps) {
  const todayKey = localDateKey(new Date());
  const { t } = useTranslation();
  const heading = formatMonthHeading(month);
  // No month after this one has stamps yet, so the calendar stops there.
  const thisMonth = currentMonth();
  const isThisMonth = monthNumber(month) >= monthNumber(thisMonth);

  const step = (delta: number) => {
    if (delta > 0 && isThisMonth) return;
    onChangeMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  };

  // Left shows the next month, right the previous one (‹ ›).
  const {
    gesture: swipe,
    stripStyle,
    onPagesLayout,
    firstMonthNumber,
  } = useMonthSwipe({
    testID,
    month,
    lastMonth: thisMonth,
    onStep: step,
  });

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickMonth = (picked: Date) => {
    onChangeMonth(
      monthNumber(picked) > monthNumber(thisMonth) ? thisMonth : picked,
    );
    setIsPickerOpen(false);
  };

  return (
    <View testID={testID} className="w-full gap-1">
      {/* The month sits above the panel, the month left and ‹ › right. On
          Logs it heads the whole screen below (S-051 T-004); rally detail
          matches it (S-055). */}
      <View className="flex-row items-center justify-between">
        <Pressable
          role="button"
          aria-label={t("calendar.chooseMonth", { month: heading })}
          className="min-h-11 justify-center"
          onPress={() => setIsPickerOpen(true)}
        >
          <Text className="text-foreground text-xl font-bold">{heading}</Text>
        </Pressable>
        <View className="flex-row">
          <Pressable
            role="button"
            aria-label={t("calendar.previousMonth")}
            className="size-11 items-center justify-center"
            onPress={() => step(-1)}
          >
            <ChevronLeft colorClassName="accent-accent" size={20} />
          </Pressable>
          <Pressable
            role="button"
            aria-label={t("calendar.nextMonth")}
            disabled={isThisMonth}
            className={
              isThisMonth
                ? "size-11 items-center justify-center opacity-30"
                : "size-11 items-center justify-center"
            }
            onPress={() => step(1)}
          >
            <ChevronRight colorClassName="accent-accent" size={20} />
          </Pressable>
        </View>
      </View>
      <GestureDetector gesture={swipe}>
        <View
          testID={`${testID}-panel`}
          className="bg-surface border-continuous w-full gap-2 rounded-3xl p-3"
        >
          {/* Each month is a page placed at its own position on a strip, so a
              page stays put when the shown month changes; the strip moves with
              the finger. The shown page sets the height; the clip hides the
              pages beside it. */}
          <View
            testID={`${testID}-pages`}
            className="overflow-hidden"
            onLayout={onPagesLayout}
          >
            <Animated.View style={stripStyle}>
              {PAGE_OFFSETS.map((offset) => {
                const pageMonth = new Date(
                  month.getFullYear(),
                  month.getMonth() + offset,
                  1,
                );
                const isShown = offset === 0;
                const left =
                  `${(monthNumber(pageMonth) - firstMonthNumber) * 100}%` as const;
                return (
                  <View
                    key={monthNumber(pageMonth)}
                    testID={`${testID}-month-${monthTestKey(pageMonth)}`}
                    // The pages beside the shown one are off screen.
                    aria-hidden={!isShown}
                    className={isShown ? "w-full" : "absolute top-0 w-full"}
                    style={{ left }}
                  >
                    <CalendarMonthPage
                      month={pageMonth}
                      stampDates={stampDates}
                      emoji={emoji}
                      dayMarks={dayMarks}
                      todayKey={todayKey}
                      onPressDay={onPressDay}
                      isRecordedOnly={isRecordedOnly}
                    />
                  </View>
                );
              })}
            </Animated.View>
          </View>
        </View>
      </GestureDetector>
      <MonthPickerSheet
        isPresented={isPickerOpen}
        month={month}
        years={pickerYears(
          firstStampedAt ? [firstStampedAt, ...stampDates] : stampDates,
          month,
        )}
        onDone={pickMonth}
        onClose={() => setIsPickerOpen(false)}
      />
    </View>
  );
}
