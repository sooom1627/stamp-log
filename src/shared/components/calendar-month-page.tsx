import { Pressable, Text, View } from "react-native";

import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import { formatSpokenDate } from "@/shared/utils/format-spoken-date";
import { formatStampCount } from "@/shared/utils/format-stamp-count";
import {
  buildMonthWeeks,
  type DayMark,
  type MonthDay,
} from "@/shared/utils/month-grid";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type CalendarDayProps = {
  day: MonthDay;
  emoji: string | undefined;
  mark: DayMark | undefined;
  todayKey: string;
  onPress: ((key: string) => void) | undefined;
  isRecordedOnly: boolean;
};

function dayLabel(t: TFunction, day: MonthDay, mark: DayMark | undefined) {
  const date = formatSpokenDate(day.date);
  if (!day.isRecorded) return t("calendar.dayNotRecorded", { date });
  if (!mark) return t("calendar.dayRecorded", { date });
  const stamps = formatStampCount(mark.extraCount + 1);
  return t("calendar.dayRecordedCount", { date, stamps });
}

// Complete class strings per state (no interpolation, see AGENTS.md).
function dayCircleClassName(isRecorded: boolean, isToday: boolean) {
  if (isRecorded && isToday) {
    return "bg-accent-soft border-accent size-10 items-center justify-center rounded-full border-2";
  }
  if (isRecorded) {
    return "bg-accent-soft size-10 items-center justify-center rounded-full";
  }
  if (isToday) {
    return "border-accent size-10 items-center justify-center rounded-full border-2";
  }
  return "size-10 items-center justify-center rounded-full";
}

function CalendarDay({
  day,
  emoji,
  mark,
  todayKey,
  onPress,
  isRecordedOnly,
}: CalendarDayProps) {
  const { t } = useTranslation();
  if (!day.isInMonth) {
    // A day of the month before or after, only to fill the week: dimmed,
    // not pressable and not read out. Its own month's page shows its stamps.
    return (
      <View aria-hidden className="flex-1 items-center py-1">
        <View
          testID={`calendar-outside-day-${day.key}`}
          className="size-10 items-center justify-center"
        >
          <Text className="text-foreground-muted text-base opacity-50">
            {day.date.getDate()}
          </Text>
        </View>
      </View>
    );
  }

  // Keys are YYYY-MM-DD, so string order is date order.
  const isFuture = day.key > todayKey;
  const isToday = day.key === todayKey;
  const isDisabled =
    isFuture || !onPress || (isRecordedOnly && !day.isRecorded);
  const extraCount = mark?.extraCount ?? 0;

  return (
    <Pressable
      role="button"
      aria-label={dayLabel(t, day, mark)}
      aria-disabled={isDisabled}
      disabled={isDisabled}
      className="flex-1 items-center py-1"
      onPress={() => onPress?.(day.key)}
    >
      <View
        testID={`calendar-day-${day.key}`}
        className={dayCircleClassName(day.isRecorded, isToday)}
      >
        {day.isRecorded ? (
          // The cell's aria-label already reads the day and "recorded".
          <Text className="text-xl">{mark?.emoji ?? emoji}</Text>
        ) : (
          <Text
            className={
              isFuture
                ? "text-foreground-muted text-base"
                : "text-foreground text-base"
            }
          >
            {day.date.getDate()}
          </Text>
        )}
        {day.isRecorded && extraCount > 0 ? (
          // Overlaps the circle's bottom-right corner; the label reads the count.
          <View
            aria-hidden
            className="bg-surface border-border absolute -right-1.5 -bottom-1 rounded-full border px-1"
          >
            <Text className="text-foreground-secondary text-[10px] font-semibold">
              +{extraCount}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export type CalendarMonthPageProps = {
  month: Date;
  stampDates: string[];
  emoji: string | undefined;
  dayMarks: ReadonlyMap<string, DayMark> | undefined;
  todayKey: string;
  onPressDay: ((key: string) => void) | undefined;
  isRecordedOnly: boolean;
};

// One month of the calendar: the weekdays and the weeks, Monday first. The
// days of the months around it fill the first and last weeks.
export function CalendarMonthPage({
  month,
  stampDates,
  emoji,
  dayMarks,
  todayKey,
  onPressDay,
  isRecordedOnly,
}: CalendarMonthPageProps) {
  const weeks = buildMonthWeeks(month, stampDates);

  return (
    <View className="gap-2">
      <View className="flex-row">
        {WEEKDAYS.map((weekday) => (
          <Text
            key={weekday}
            className="text-foreground-muted flex-1 text-center text-xs"
          >
            {weekday}
          </Text>
        ))}
      </View>
      {weeks.map((week) => (
        <View key={week[0].key} className="flex-row">
          {week.map((day) => (
            <CalendarDay
              key={day.key}
              day={day}
              emoji={emoji}
              mark={dayMarks?.get(day.key)}
              todayKey={todayKey}
              onPress={onPressDay}
              isRecordedOnly={isRecordedOnly}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
