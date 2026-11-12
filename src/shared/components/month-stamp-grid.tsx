import { Text, View } from "react-native";

import { type MonthShare } from "@/shared/utils/month-share-grid";

type MonthStampGridProps = {
  share: MonthShare;
  /** Labels the 1st, 8th, 15th, 22nd and 29th above the cells (the share image). */
  showDays?: boolean;
};

// The days are split into runs of 7 from the 1st (1–7, 8–14, …), not into
// calendar weeks, so the labels fall at even steps.
function startsWeek(day: number) {
  return day % 7 === 1;
}

// One row per rally and one cell per day of the month (B1, S-058 T-003): the
// share image and home's last-month card draw the same grid. Only three
// cells: not stamped, stamped, and the month's last stamp. A small gap marks
// where each run of 7 days starts.
export function MonthStampGrid({
  share,
  showDays = false,
}: MonthStampGridProps) {
  const days = Array.from(
    { length: share.daysInMonth },
    (_, index) => index + 1,
  );
  // Before the 8th, 15th, 22nd and 29th, the week gap.
  const weekGap = (day: number) => (day > 1 && startsWeek(day) ? "ml-1" : "");

  return (
    <View testID="month-grid" className="gap-px">
      {showDays ? (
        <View testID="month-grid-days" className="flex-row items-end gap-1">
          <View className="w-4" />
          <View className="flex-1 flex-row gap-px">
            {days.map((day) => (
              <View key={day} className={`flex-1 items-center ${weekGap(day)}`}>
                {startsWeek(day) ? (
                  <Text
                    numberOfLines={1}
                    className="text-foreground-muted text-caption2 w-6 text-center"
                  >
                    {day}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      ) : null}
      {share.rows.map(({ rally, days: stampedDays }) => (
        <View
          key={rally.id}
          testID="month-grid-row"
          className="flex-row items-center gap-1"
        >
          <Text className="w-4 text-center text-xs">{rally.emoji}</Text>
          <View className="flex-1 flex-row gap-px">
            {days.map((day) => {
              const isLatest =
                share.latest?.rallyId === rally.id && share.latest.day === day;
              const isStamped = stampedDays.has(day);
              return (
                <View
                  key={day}
                  testID={
                    isLatest
                      ? "month-cell-latest"
                      : isStamped
                        ? "month-cell-stamped"
                        : "month-cell"
                  }
                  className={`aspect-square flex-1 ${weekGap(day)} ${
                    isLatest
                      ? "bg-accent"
                      : isStamped
                        ? "bg-foreground"
                        : "bg-foreground/10"
                  }`}
                />
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
