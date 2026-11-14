import { Text, View } from "react-native";

import { formatRallyCount } from "@/shared/utils/format-rally-count";
import { formatStampCount } from "@/shared/utils/format-stamp-count";

import { type YearShare } from "../utils/year-share";

const MONTH_LETTERS = [
  "J",
  "F",
  "M",
  "A",
  "M",
  "J",
  "J",
  "A",
  "S",
  "O",
  "N",
  "D",
];
const MONTHS = MONTH_LETTERS.map((_, index) => index + 1);

type YearStampGridProps = {
  share: YearShare;
};

// The year review's months page: one row per rally and one cell per month,
// with the month image's three cells (not stamped, stamped, the year's last
// stamp).
export function YearStampGrid({ share }: YearStampGridProps) {
  return (
    <View testID="year-grid" className="gap-1">
      <View className="flex-row items-end gap-2">
        <View className="w-6" />
        <View className="flex-1 flex-row gap-1">
          {MONTH_LETTERS.map((letter, index) => (
            <Text
              key={index}
              className="text-foreground-muted text-caption2 flex-1 text-center"
            >
              {letter}
            </Text>
          ))}
        </View>
      </View>
      {share.rows.map(({ rally, months }) => (
        <View
          key={rally.id}
          testID="year-grid-row"
          className="flex-row items-center gap-2"
        >
          <Text className="text-subhead w-6 text-center">{rally.emoji}</Text>
          <View className="flex-1 flex-row gap-1">
            {MONTHS.map((month) => {
              const isLatest =
                share.latest?.rallyId === rally.id &&
                share.latest.month === month;
              const isStamped = months.has(month);
              return (
                <View
                  key={month}
                  testID={
                    isLatest
                      ? "year-cell-latest"
                      : isStamped
                        ? "year-cell-stamped"
                        : "year-cell"
                  }
                  className={`aspect-square flex-1 ${
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
      {share.rest ? <RestLine rest={share.rest} /> : null}
    </View>
  );
}

// The rallies past the rows, summed into one line (as the month image).
export function RestLine({ rest }: { rest: NonNullable<YearShare["rest"]> }) {
  return (
    <Text className="text-foreground-muted text-footnote">
      {`+${formatRallyCount(rest.rallyCount)} · ${formatStampCount(rest.stampCount)}`}
    </Text>
  );
}
