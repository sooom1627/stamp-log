import { useState } from "react";

import { Pressable, Text, View } from "react-native";

import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

import { useMonthSwipe } from "@/shared/hooks/use-month-swipe";
import { formatSpokenDate } from "@/shared/utils/format-spoken-date";
import { formatStampCount } from "@/shared/utils/format-stamp-count";
import { localDateKey } from "@/shared/utils/local-date-key";
import {
  buildMonthWeeks,
  formatMonthHeading,
  pickerYears,
  type DayMark,
  type MonthDay,
} from "@/shared/utils/month-grid";

import { ChevronLeft, ChevronRight } from "./icons";
import { MonthPickerSheet } from "./month-picker-sheet";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type CalendarDayProps = {
  day: MonthDay | null;
  emoji: string | undefined;
  mark: DayMark | undefined;
  todayKey: string;
  onPress: ((key: string) => void) | undefined;
  isRecordedOnly: boolean;
};

function dayLabel(t: TFunction, day: MonthDay, mark: DayMark | undefined) {
  const date = formatSpokenDate(day.date);
  if (!day.isRecorded) return t("calendar.dayNotRecorded", { date });
  if (!mark) return t("calendar.dayRecorded", { date });
  const stamps = formatStampCount(mark.extraCount + 1);
  return t("calendar.dayRecordedCount", { date, stamps });
}

// Complete class strings per state (no interpolation, see AGENTS.md).
function dayCircleClassName(isRecorded: boolean, isToday: boolean) {
  if (isRecorded && isToday) {
    return "bg-accent-soft border-accent size-10 items-center justify-center rounded-full border-2";
  }
  if (isRecorded) {
    return "bg-accent-soft size-10 items-center justify-center rounded-full";
  }
  if (isToday) {
    return "border-accent size-10 items-center justify-center rounded-full border-2";
  }
  return "size-10 items-center justify-center rounded-full";
}

function CalendarDay({
  day,
  emoji,
  mark,
  todayKey,
  onPress,
  isRecordedOnly,
}: CalendarDayProps) {
  const { t } = useTranslation();
  if (!day) return <View className="flex-1" />;

  // Keys are YYYY-MM-DD, so string order is date order.
  const isFuture = day.key > todayKey;
  const isToday = day.key === todayKey;
  const isDisabled =
    isFuture || !onPress || (isRecordedOnly && !day.isRecorded);
  const extraCount = mark?.extraCount ?? 0;

  return (
    <Pressable
      role="button"
      aria-label={dayLabel(t, day, mark)}
      aria-disabled={isDisabled}
      disabled={isDisabled}
      className="flex-1 items-center py-1"
      onPress={() => onPress?.(day.key)}
    >
      <View
        testID={`calendar-day-${day.key}`}
        className={dayCircleClassName(day.isRecorded, isToday)}
      >
        {day.isRecorded ? (
          // The cell's aria-label already reads the day and "recorded".
          <Text className="text-xl">{mark?.emoji ?? emoji}</Text>
        ) : (
          <Text
            className={
              isFuture
                ? "text-foreground-muted text-base"
                : "text-foreground text-base"
            }
          >
            {day.date.getDate()}
          </Text>
        )}
        {day.isRecorded && extraCount > 0 ? (
          // Overlaps the circle's bottom-right corner; the label reads the count.
          <View
            aria-hidden
            className="bg-surface border-border absolute -right-1.5 -bottom-1 rounded-full border px-1"
          >
            <Text className="text-foreground-secondary text-[10px] font-semibold">
              +{extraCount}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
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
  const weeks = buildMonthWeeks(month, stampDates);
  const heading = formatMonthHeading(month);

  const step = (delta: number) =>
    onChangeMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));

  // Left shows the next month, right the previous one (‹ ›).
  const {
    gesture: swipe,
    daysStyle,
    onDaysLayout,
  } = useMonthSwipe({ testID, month, onStep: step });

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickMonth = (picked: Date) => {
    onChangeMonth(picked);
    setIsPickerOpen(false);
  };

  return (
    <GestureDetector gesture={swipe}>
      <View
        testID={testID}
        className="bg-surface border-continuous w-full gap-2 rounded-3xl p-3"
      >
        <View className="flex-row items-center justify-between">
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
            aria-label={t("calendar.chooseMonth", { month: heading })}
            className="min-h-11 justify-center px-2"
            onPress={() => setIsPickerOpen(true)}
          >
            <Text className="text-foreground text-base font-semibold">
              {heading}
            </Text>
          </Pressable>
          <Pressable
            role="button"
            aria-label={t("calendar.nextMonth")}
            className="size-11 items-center justify-center"
            onPress={() => step(1)}
          >
            <ChevronRight colorClassName="accent-accent" size={20} />
          </Pressable>
        </View>
        <View className="flex-row">
          {WEEKDAYS.map((weekday) => (
            <Text
              key={weekday}
              className="text-foreground-muted flex-1 text-center text-xs"
            >
              {weekday}
            </Text>
          ))}
        </View>
        {/* Only the days move with the finger; the clip keeps them inside
            the card while they slide. */}
        <View className="overflow-hidden" onLayout={onDaysLayout}>
          <Animated.View style={daysStyle} className="gap-2">
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} className="flex-row">
                {week.map((day, dayIndex) => (
                  <CalendarDay
                    key={day?.key ?? `blank-${dayIndex}`}
                    day={day}
                    emoji={emoji}
                    mark={day ? dayMarks?.get(day.key) : undefined}
                    todayKey={todayKey}
                    onPress={onPressDay}
                    isRecordedOnly={isRecordedOnly}
                  />
                ))}
              </View>
            ))}
          </Animated.View>
        </View>
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
    </GestureDetector>
  );
}
