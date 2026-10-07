import { FlatList, Text, View } from "react-native";

import { formatStampCount } from "@/shared/utils/format-stamp-count";

import { type StampedDay } from "../utils/stamped-days";

const MAX_VISIBLE_EMOJIS = 3;

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});
const spokenDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});
const spokenTodayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

function spokenLabel(day: StampedDay) {
  const date = day.isToday
    ? `Today, ${spokenTodayFormatter.format(day.date)}`
    : spokenDateFormatter.format(day.date);
  const count =
    day.emojis.length === 0
      ? "no stamps yet"
      : formatStampCount(day.emojis.length);
  return `${date}, ${count}`;
}

// A fixed tilt per date (-4° to 4°) so a day keeps its angle across renders.
function tiltFor(date: Date) {
  return `${((date.getDate() * 7) % 9) - 4}deg`;
}

function DateStamp({ day }: { day: StampedDay }) {
  const isEmptyToday = day.emojis.length === 0;
  const visibleEmojis = day.emojis.slice(0, MAX_VISIBLE_EMOJIS);

  return (
    <View
      accessible
      aria-label={spokenLabel(day)}
      className="w-16 items-center gap-2"
      testID="date-stamp"
    >
      {isEmptyToday ? (
        <View className="border-accent size-16 items-center justify-center rounded-full border-2 border-dashed">
          <Text className="text-accent-strong text-[10px] font-semibold tracking-wider">
            {monthFormatter.format(day.date).toUpperCase()}
          </Text>
          <Text className="text-accent-strong text-lg leading-6 font-semibold">
            {day.date.getDate()}
          </Text>
        </View>
      ) : (
        <View
          className="border-accent size-16 rounded-full border-[3px] p-0.5"
          style={{ transform: [{ rotate: tiltFor(day.date) }] }}
        >
          <View className="border-accent bg-background flex-1 flex-row items-center justify-center rounded-full border">
            {visibleEmojis.map((emoji, index) => (
              <Text
                key={`${index}-${emoji}`}
                className={
                  visibleEmojis.length === 1
                    ? "text-2xl"
                    : index === 0
                      ? "text-lg"
                      : "-ml-2 text-lg"
                }
              >
                {emoji}
              </Text>
            ))}
          </View>
        </View>
      )}
      <Text
        className={
          day.isToday
            ? "text-foreground text-xs font-semibold"
            : "text-accent-strong text-xs font-medium"
        }
      >
        {day.isToday
          ? "Today"
          : `${weekdayFormatter.format(day.date)} ${day.date.getDate()}`}
      </Text>
    </View>
  );
}

type StampedDaysStripProps = {
  days: StampedDay[];
  totalStampCount: number;
};

export function StampedDaysStrip({
  days,
  totalStampCount,
}: StampedDaysStripProps) {
  return (
    <View
      className="bg-accent-subtle border-continuous mb-4 gap-3 rounded-3xl py-4"
      testID="stamped-days-strip"
    >
      <View className="flex-row items-center justify-between px-5">
        <Text className="text-accent-strong text-sm font-semibold">
          Last 7 days
        </Text>
        <Text
          className="text-accent-strong text-sm font-semibold"
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {formatStampCount(totalStampCount)}
        </Text>
      </View>
      {/* Newest first: today sits on the left and is visible on open. */}
      <FlatList
        horizontal
        testID="stamped-days-list"
        data={days}
        keyExtractor={(day) => day.dateKey}
        renderItem={({ item }) => <DateStamp day={item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 px-5"
      />
    </View>
  );
}
