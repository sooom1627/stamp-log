import { Text, View } from "react-native";

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
  const month = new Date();
  const weeks = buildMonthWeeks(month, stampDates);

  return (
    <View className="w-full gap-2 pt-2">
      <Text className="text-foreground text-center text-base font-semibold">
        {monthFormatter.format(month)}
      </Text>
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
