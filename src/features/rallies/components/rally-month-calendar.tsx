import { useState } from "react";

import { Pressable, Text, View } from "react-native";

import { ChevronLeft, ChevronRight } from "@/shared/components/icons";

import { buildMonthWeeks, type MonthDay } from "../utils/month-grid";

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});
const dayFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CalendarDay({ day }: { day: MonthDay | null }) {
  if (!day) return <View className="flex-1" />;

  return (
    <View
      accessible
      aria-label={`${dayFormatter.format(day.date)}, ${
        day.isRecorded ? "recorded" : "not recorded"
      }`}
      className="flex-1 items-center gap-1 py-1"
    >
      <Text className="text-foreground text-sm">{day.date.getDate()}</Text>
      <View
        className={
          day.isRecorded ? "bg-accent size-1.5 rounded-full" : "size-1.5"
        }
      />
    </View>
  );
}

type RallyMonthCalendarProps = {
  stampDates: string[];
};

export function RallyMonthCalendar({ stampDates }: RallyMonthCalendarProps) {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const weeks = buildMonthWeeks(month, stampDates);

  const shiftMonth = (delta: number) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));

  return (
    <View className="w-full gap-2 pt-2">
      <View className="flex-row items-center justify-between">
        <Pressable
          role="button"
          aria-label="Previous month"
          className="size-11 items-center justify-center"
          onPress={() => shiftMonth(-1)}
        >
          <ChevronLeft colorClassName="accent-accent" size={20} />
        </Pressable>
        <Text className="text-foreground text-base font-semibold">
          {monthFormatter.format(month)}
        </Text>
        <Pressable
          role="button"
          aria-label="Next month"
          className="size-11 items-center justify-center"
          onPress={() => shiftMonth(1)}
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
            <CalendarDay key={day?.key ?? `blank-${dayIndex}`} day={day} />
          ))}
        </View>
      ))}
    </View>
  );
}
