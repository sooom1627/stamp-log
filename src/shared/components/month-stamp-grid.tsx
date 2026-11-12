import { Text, View } from "react-native";

import { type MonthShare } from "@/shared/utils/month-share-grid";

type MonthStampGridProps = {
  month: Date;
  share: MonthShare;
  /** Labels the 1st and each Monday above the cells (the share image). */
  showDays?: boolean;
};

function isMonday(month: Date, day: number) {
  return new Date(month.getFullYear(), month.getMonth(), day).getDay() === 1;
}

// One row per rally and one cell per day of the month (B1, S-058 T-003): the
// share image and home's last-month card draw the same grid. Only three
// cells: not stamped, stamped, and the month's last stamp. A small gap marks
// where each week starts.
export function MonthStampGrid({
  month,
  share,
  showDays = false,
}: MonthStampGridProps) {
  const days = Array.from(
    { length: share.daysInMonth },
    (_, index) => index + 1,
  );
  // Before a Monday (but not before the 1st), the week gap.
  const weekGap = (day: number) =>
    day > 1 && isMonday(month, day) ? "ml-1" : "";

  return (
    <View testID="month-grid" className="gap-px">
      {showDays ? (
        <View className="flex-row items-end gap-1">
          <View className="w-4" />
          <View className="flex-1 flex-row gap-px">
            {days.map((day) => (
              <View key={day} className={`flex-1 items-center ${weekGap(day)}`}>
                {day === 1 || isMonday(month, day) ? (
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
