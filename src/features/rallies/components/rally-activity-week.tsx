import { Text, View } from "react-native";

import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";

import { formatSpokenDate } from "@/shared/utils/format-spoken-date";
import { type MonthDay } from "@/shared/utils/month-grid";
import { dotPop } from "@/shared/utils/motion";

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

// "Mon" → "Mo": one letter repeats T and S, three do not fit a tile.
function twoLetterWeekday(date: Date) {
  return weekdayFormatter.format(date).slice(0, 2);
}

// The last 7 days, oldest to today, as two-letter weekdays over dots. With
// popsToday, today's dot swells once as it fills (S-056).
export function RallyActivityWeek({
  activityDays,
  popsToday = false,
}: {
  activityDays: MonthDay[];
  popsToday?: boolean;
}) {
  const { t } = useTranslation();

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
        {activityDays.map((day, index) => {
          const formattedDate = formatSpokenDate(day.date);
          const isToday = index === activityDays.length - 1;
          return (
            <View
              key={day.key}
              accessible
              aria-label={
                day.isRecorded
                  ? t("home.dayRecorded", { date: formattedDate })
                  : t("home.dayNotRecorded", { date: formattedDate })
              }
              aria-selected={day.isRecorded}
              className="h-3 flex-1 items-center justify-center"
              testID="activity-day"
            >
              {day.isRecorded ? (
                // A new view when the day fills, so the pop runs then.
                <Animated.View
                  entering={isToday && popsToday ? dotPop : undefined}
                  className="bg-foreground size-2 rounded-full"
                />
              ) : (
                <View className="bg-foreground-muted size-1.5 rounded-full opacity-40" />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
