import { Text, View } from "react-native";

import { localDateKey } from "@/shared/utils/local-date-key";

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "narrow",
});
const activityDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

type ActivityDay = {
  date: Date;
  key: string;
  isRecorded: boolean;
};

export function buildActivityDays(stampDates: string[], today = new Date()) {
  const recordedDateKeys = new Set(
    stampDates.map((stampDate) => localDateKey(new Date(stampDate))),
  );
  const localToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return Array.from({ length: 7 }, (_, index): ActivityDay => {
    const date = new Date(localToday);
    date.setDate(localToday.getDate() - (6 - index));
    const key = localDateKey(date);
    return { date, key, isRecorded: recordedDateKeys.has(key) };
  });
}

// The last 7 days, oldest to today, as one-letter weekdays over dots.
export function RallyActivityWeek({ stampDates }: { stampDates: string[] }) {
  const activityDays = buildActivityDays(stampDates);

  return (
    <View className="w-full gap-1.5" testID="activity-week">
      <View className="flex-row">
        {activityDays.map((day) => (
          <Text
            key={day.key}
            className="text-foreground-muted flex-1 text-center text-[10px] font-medium"
            testID="activity-weekday"
          >
            {weekdayFormatter.format(day.date)}
          </Text>
        ))}
      </View>
      <View className="flex-row">
        {activityDays.map((day) => {
          const formattedDate = activityDateFormatter.format(day.date);
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
                    ? "bg-accent size-2.5 rounded-full"
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
