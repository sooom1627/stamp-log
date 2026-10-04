import { useState } from "react";

import { Pressable, Text, View } from "react-native";

import { ChevronLeft, ChevronRight } from "@/shared/components/icons";
import { localDateKey } from "@/shared/utils/local-date-key";

import {
  buildMonthWeeks,
  buildWeek,
  shiftWeek,
  weekHeadingMonth,
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
  todayKey: string;
  onPress: (key: string) => void;
};

function CalendarDay({ day, todayKey, onPress }: CalendarDayProps) {
  if (!day) return <View className="flex-1" />;

  // Keys are YYYY-MM-DD, so string order is date order.
  const isFuture = day.key > todayKey;

  return (
    <Pressable
      role="button"
      aria-label={`${dayFormatter.format(day.date)}, ${
        day.isRecorded ? "recorded" : "not recorded"
      }`}
      aria-disabled={isFuture}
      disabled={isFuture}
      className="flex-1 items-center gap-1 py-1"
      onPress={() => onPress(day.key)}
    >
      <Text className="text-foreground text-sm">{day.date.getDate()}</Text>
      <View
        className={
          day.isRecorded ? "bg-accent size-1.5 rounded-full" : "size-1.5"
        }
      />
    </Pressable>
  );
}

type RallyMonthCalendarProps = {
  stampDates: string[];
  // Called with the YYYY-MM-DD key of a day up to today.
  onPressDay: (key: string) => void;
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
  stampDates,
  onPressDay,
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
    <View className="w-full gap-2 pt-2">
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
              todayKey={todayKey}
              onPress={onPressDay}
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
