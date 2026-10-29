import { useEffect, useState } from "react";

import { Text, View } from "react-native";

import { formatStampCount } from "@/shared/utils/format-stamp-count";
import { formatStampTime } from "@/shared/utils/format-stamp-date-time";

import { type TodayLogEntry } from "../utils/today-log";

import { TopCard } from "./top-card";

const TICKS = [0, 6, 12, 18, 24];
const MAX_TIMES = 3;
// Often enough that "now" never trails the clock by much.
const CLOCK_INTERVAL_MS = 15_000;

const percentOfDay = (hour: number) => `${(hour / 24) * 100}%` as const;

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), CLOCK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);
  return now;
}

function spokenLabel(entries: TodayLogEntry[], position: string) {
  if (entries.length === 0) return `Today's log, no stamps yet, ${position}`;
  const stamps = entries
    .map((entry) => `${formatStampTime(entry.stampedAt)} ${entry.name}`)
    .join(", ");
  return `Today's log, ${formatStampCount(entries.length)}: ${stamps}, ${position}`;
}

type TodayLogCardProps = {
  // Today's stamps, oldest first.
  entries: TodayLogEntry[];
  width: number;
  position: string;
};

// The third of home's top cards: today's stamps as dots on a line from
// midnight to midnight, with a line at the current time, and the latest
// times below.
export function TodayLogCard({ entries, width, position }: TodayLogCardProps) {
  const now = useNow();
  const nowHour = now.getHours() + now.getMinutes() / 60;
  const latest = entries.slice(-MAX_TIMES);
  const earlierCount = entries.length - latest.length;

  return (
    <TopCard
      label="Today's log"
      detail={`now ${formatStampTime(now)}`}
      tone="today"
      spokenLabel={spokenLabel(entries, position)}
      width={width}
      testID="today-log-card"
    >
      <View className="flex-1 justify-center gap-5 pt-2">
        <View className="mx-1 h-10">
          <View className="bg-border absolute inset-x-0 top-5 h-px" />
          <View
            className="bg-accent absolute top-3 h-5.5 w-px opacity-70"
            style={{ left: percentOfDay(nowHour) }}
            testID="today-log-now"
          />
          {entries.map((entry) => (
            <View
              key={entry.stampId}
              className="absolute top-0 -ml-2 w-4 items-center"
              style={{ left: percentOfDay(entry.hour) }}
            >
              <Text className="text-[13px] leading-4">{entry.emoji}</Text>
              <View
                className="bg-accent mt-0.25 size-2.25 rounded-full"
                testID="today-log-dot"
              />
            </View>
          ))}
          {TICKS.map((hour) => (
            <Text
              key={hour}
              className="text-foreground-muted absolute top-7 -ml-2 w-4 text-center text-[10px]"
              style={{ left: percentOfDay(hour) }}
            >
              {hour}
            </Text>
          ))}
        </View>
        {entries.length > 0 ? (
          <View className="flex-row gap-3.5" testID="today-log-times">
            {earlierCount > 0 ? (
              <Text className="text-foreground-muted text-[13px]">
                {`+${earlierCount}`}
              </Text>
            ) : null}
            {latest.map((entry) => (
              <Text
                key={entry.stampId}
                className="text-foreground-secondary text-[13px]"
              >
                {`${entry.emoji} ${formatStampTime(entry.stampedAt)}`}
              </Text>
            ))}
          </View>
        ) : (
          <Text className="text-foreground-muted text-[13px]">
            Each stamp today lands on this line.
          </Text>
        )}
      </View>
    </TopCard>
  );
}
