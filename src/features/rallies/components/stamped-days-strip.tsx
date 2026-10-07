import { ScrollView, Text, View } from "react-native";

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
  if (day.emojis.length > 0) {
    return `${date}, ${formatStampCount(day.emojis.length)}`;
  }
  return `${date}, ${day.isToday ? "no stamps yet" : "no stamps"}`;
}

// A fixed tilt per date (-4° to 4°) so a day keeps its angle across renders.
function tiltFor(date: Date) {
  return `${((date.getDate() * 7) % 9) - 4}deg`;
}

function InkedStamp({ day }: { day: StampedDay }) {
  const visibleEmojis = day.emojis.slice(0, MAX_VISIBLE_EMOJIS);

  return (
    <View
      className="border-accent bg-background size-16 flex-row items-center justify-center rounded-full border-[1.5px]"
      style={{ transform: [{ rotate: tiltFor(day.date) }] }}
    >
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
  );
}

// No ink: a faint dashed ring with the month and day.
function BlankStamp({ day }: { day: StampedDay }) {
  return (
    <View className="size-16 items-center justify-center">
      <View className="border-foreground-muted absolute inset-0 rounded-full border-[1.5px] border-dashed opacity-40" />
      <Text className="text-foreground-muted text-[9px] font-semibold tracking-wider">
        {monthFormatter.format(day.date).toUpperCase()}
      </Text>
      <Text className="text-foreground-muted text-lg leading-5 font-semibold">
        {day.date.getDate()}
      </Text>
    </View>
  );
}

function DateStamp({ day }: { day: StampedDay }) {
  return (
    <View
      accessible
      aria-label={spokenLabel(day)}
      className="w-16 items-center gap-2"
      testID="date-stamp"
    >
      {day.emojis.length > 0 ? (
        <InkedStamp day={day} />
      ) : (
        <BlankStamp day={day} />
      )}
      <Text
        className={
          day.isToday
            ? "text-foreground text-xs font-semibold"
            : "text-foreground-muted text-xs font-medium"
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
      className="bg-surface-muted border-continuous mb-4 gap-3 rounded-3xl py-4"
      testID="stamped-days-strip"
    >
      <View className="flex-row items-center justify-between px-5">
        <Text className="text-foreground-secondary text-sm font-semibold">
          Last 14 days
        </Text>
        <Text
          className="text-foreground-secondary text-sm font-semibold"
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {formatStampCount(totalStampCount)}
        </Text>
      </View>
      {/* Newest first: today sits on the left and is visible on open. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 px-5 py-1"
        testID="stamped-days-list"
      >
        {days.map((day) => (
          <DateStamp key={day.dateKey} day={day} />
        ))}
      </ScrollView>
    </View>
  );
}
