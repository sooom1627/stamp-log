import { useState } from "react";

import { Pressable, Text, View } from "react-native";

import { ChevronLeft, ChevronRight } from "@/shared/components/icons";
import { formatStampCount } from "@/shared/utils/format-stamp-count";
import { localDateKey } from "@/shared/utils/local-date-key";

import {
  buildMonthWeeks,
  buildWeek,
  shiftWeek,
  weekHeadingMonth,
  type DayMark,
  type MonthDay,
} from "../utils/month-grid";

import { MonthPickerSheet } from "./month-picker-sheet";

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});
const dayFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type CalendarDayProps = {
  day: MonthDay | null;
  emoji: string | undefined;
  mark: DayMark | undefined;
  todayKey: string;
  onPress: ((key: string) => void) | undefined;
  isRecordedOnly: boolean;
};

function dayLabel(day: MonthDay, mark: DayMark | undefined) {
  const date = dayFormatter.format(day.date);
  if (!day.isRecorded) return `${date}, not recorded`;
  if (!mark) return `${date}, recorded`;
  return `${date}, recorded, ${formatStampCount(mark.extraCount + 1)}`;
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
      aria-label={dayLabel(day, mark)}
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
};

function firstDayOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// From the first stamp's year (or this year) to next year, always including
// the shown month's year so the wheel can select it.
function pickerYears(stampDates: string[], shownMonth: Date) {
  const thisYear = new Date().getFullYear();
  const stampYears = stampDates.map((stampDate) =>
    new Date(stampDate).getFullYear(),
  );
  const from = Math.min(thisYear, shownMonth.getFullYear(), ...stampYears);
  const to = Math.max(thisYear + 1, shownMonth.getFullYear());
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

export function RallyMonthCalendar({
  testID = "rally-calendar",
  stampDates,
  emoji,
  dayMarks,
  onPressDay,
  isRecordedOnly = false,
}: RallyMonthCalendarProps) {
  const todayKey = localDateKey(new Date());
  // Opens on the week holding today every time; the view is not remembered.
  const [isMonthView, setIsMonthView] = useState(false);
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [month, setMonth] = useState(() => firstDayOfMonth(new Date()));
  const weeks = isMonthView
    ? buildMonthWeeks(month, stampDates)
    : [buildWeek(weekAnchor, stampDates)];

  const showMonth = () => setIsMonthView(true);
  const showWeek = () => {
    const today = new Date();
    setWeekAnchor(today);
    setMonth(firstDayOfMonth(today));
    setIsMonthView(false);
  };

  // ‹ › step by the unit on screen: a week in the week view, a month otherwise.
  const step = (delta: number) => {
    if (isMonthView) {
      setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
      return;
    }
    const nextAnchor = shiftWeek(weekAnchor, delta);
    setWeekAnchor(nextAnchor);
    setMonth(weekHeadingMonth(month, buildWeek(nextAnchor, [])));
  };
  const unit = isMonthView ? "month" : "week";
  const heading = monthFormatter.format(month);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickMonth = (picked: Date) => {
    setMonth(picked);
    setIsMonthView(true);
    setIsPickerOpen(false);
  };

  return (
    <View
      testID={testID}
      className="bg-surface border-continuous w-full gap-2 rounded-3xl p-3"
    >
      <View className="flex-row items-center justify-between">
        <Pressable
          role="button"
          aria-label={`Previous ${unit}`}
          className="size-11 items-center justify-center"
          onPress={() => step(-1)}
        >
          <ChevronLeft colorClassName="accent-accent" size={20} />
        </Pressable>
        <Pressable
          role="button"
          aria-label={`Choose month, ${heading}`}
          className="min-h-11 justify-center px-2"
          onPress={() => setIsPickerOpen(true)}
        >
          <Text className="text-foreground text-base font-semibold">
            {heading}
          </Text>
        </Pressable>
        <Pressable
          role="button"
          aria-label={`Next ${unit}`}
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
      <Pressable
        role="button"
        aria-expanded={isMonthView}
        className="min-h-11 items-center justify-center self-center px-4"
        onPress={isMonthView ? showWeek : showMonth}
      >
        <Text className="text-foreground-secondary text-sm font-semibold">
          {isMonthView ? "Show week" : "Show month"}
        </Text>
      </Pressable>
      <MonthPickerSheet
        isPresented={isPickerOpen}
        month={month}
        years={pickerYears(stampDates, month)}
        onDone={pickMonth}
        onClose={() => setIsPickerOpen(false)}
      />
    </View>
  );
}
