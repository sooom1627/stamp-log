import { useEffect, useState } from "react";

import { Text, View } from "react-native";

import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

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

function spokenLabel(t: TFunction, entries: TodayLogEntry[], position: string) {
  if (entries.length === 0) {
    return t("home.todayLogSpokenEmpty", { position });
  }
  const list = entries
    .map((entry) => `${formatStampTime(entry.stampedAt)} ${entry.name}`)
    .join(", ");
  return t("home.todayLogSpoken", {
    stamps: formatStampCount(entries.length),
    list,
    position,
  });
}

type TodayLogCardProps = {
  // Today's stamps, oldest first.
  entries: TodayLogEntry[];
  width: number;
  position: string;
};

// The second of home's top cards: today's stamps as dots on a line from
// midnight to midnight, with a line at the current time, and the latest
// emojis and times below. The line carries dots only, so stamps close in
// time do not pile their emojis on each other.
export function TodayLogCard({ entries, width, position }: TodayLogCardProps) {
  const now = useNow();
  const { t } = useTranslation();
  const nowHour = now.getHours() + now.getMinutes() / 60;
  const latest = entries.slice(-MAX_TIMES);
  const earlierCount = entries.length - latest.length;

  return (
    <TopCard
      label={t("home.todayLog")}
      detail={t("home.now", { time: formatStampTime(now) })}
      tone="today"
      spokenLabel={spokenLabel(t, entries, position)}
      width={width}
      testID="today-log-card"
    >
      <View className="flex-1 justify-center gap-5 pt-2">
        <View className="mx-1 h-9" testID="today-log-line">
          <View className="bg-border absolute inset-x-0 top-3 h-px" />
          <View
            className="bg-accent absolute top-0.5 h-5 w-px opacity-70"
            style={{ left: percentOfDay(nowHour) }}
            testID="today-log-now"
          />
          {entries.map((entry) => (
            <View
              key={entry.stampId}
              className="bg-accent -ml-1.125 absolute top-2 size-2.25 rounded-full"
              style={{ left: percentOfDay(entry.hour) }}
              testID="today-log-dot"
            />
          ))}
          {TICKS.map((hour) => (
            <Text
              key={hour}
              className="text-foreground-muted absolute top-5 -ml-2 w-4 text-center text-[10px]"
              style={{ left: percentOfDay(hour) }}
            >
              {hour}
            </Text>
          ))}
        </View>
        {entries.length > 0 ? (
          <View className="flex-row gap-3.5" testID="today-log-times">
            {earlierCount > 0 ? (
              <Text className="text-foreground-muted text-sm">
                {`+${earlierCount}`}
              </Text>
            ) : null}
            {latest.map((entry) => (
              <Text
                key={entry.stampId}
                className="text-foreground-secondary text-sm"
              >
                {`${entry.emoji} ${formatStampTime(entry.stampedAt)}`}
              </Text>
            ))}
          </View>
        ) : (
          <Text className="text-foreground-muted text-sm">
            {t("home.todayLogEmpty")}
          </Text>
        )}
      </View>
    </TopCard>
  );
}
