import { Text, View } from "react-native";

import { formatSpokenDate } from "@/shared/utils/format-spoken-date";
import { type MonthDay } from "@/shared/utils/month-grid";

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

// "Mon" → "Mo": one letter repeats T and S, three do not fit a tile.
function twoLetterWeekday(date: Date) {
  return weekdayFormatter.format(date).slice(0, 2);
}

// The last 7 days, oldest to today, as two-letter weekdays over dots.
export function RallyActivityWeek({
  activityDays,
}: {
  activityDays: MonthDay[];
}) {
  return (
    <View className="w-full gap-1.5" testID="activity-week">
      <View className="flex-row">
        {activityDays.map((day, index) => (
          <Text
            key={day.key}
            className={
              index === activityDays.length - 1
                ? "text-foreground flex-1 text-center text-[10px] font-bold"
                : "text-foreground-muted flex-1 text-center text-[10px] font-medium"
            }
            testID="activity-weekday"
          >
            {twoLetterWeekday(day.date)}
          </Text>
        ))}
      </View>
      <View className="flex-row">
        {activityDays.map((day) => {
          const formattedDate = formatSpokenDate(day.date);
          return (
            <View
              key={day.key}
              accessible
              aria-label={`${formattedDate}, ${
                day.isRecorded ? "recorded" : "not recorded"
              }`}
              aria-selected={day.isRecorded}
              className="h-3 flex-1 items-center justify-center"
              testID="activity-day"
            >
              <View
                className={
                  day.isRecorded
                    ? "bg-foreground size-2 rounded-full"
                    : "bg-foreground-muted size-1.5 rounded-full opacity-40"
                }
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}
