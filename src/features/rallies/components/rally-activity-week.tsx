import { Pressable, Text, View } from "react-native";

import { SymbolView } from "expo-symbols";

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});
const activityDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

type ActivityDay = {
  date: Date;
  key: string;
  isRecorded: boolean;
  isToday: boolean;
};

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildActivityDays(stampDates: string[], today = new Date()) {
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
    return {
      date,
      key,
      isRecorded: recordedDateKeys.has(key),
      isToday: index === 6,
    };
  });
}

function ActivityDayCircle({
  day,
  rallyName,
  onPressToday,
}: {
  day: ActivityDay;
  rallyName: string;
  onPressToday: () => void;
}) {
  const formattedDate = activityDateFormatter.format(day.date);

  if (day.isToday) {
    return (
      <Pressable
        role="button"
        accessibilityLabel={
          day.isRecorded
            ? `${rallyName} already stamped today`
            : `Stamp ${rallyName} for today`
        }
        accessibilityState={{
          disabled: day.isRecorded,
          selected: day.isRecorded,
        }}
        accessibilityValue={{ text: formattedDate }}
        className="flex-1 items-center"
        disabled={day.isRecorded}
        onPress={onPressToday}
        testID="activity-day"
      >
        <View
          className="border-accent size-6 items-center justify-center rounded-full border"
          testID="activity-today-ring"
        >
          {day.isRecorded ? (
            <View className="bg-accent size-3 rounded-full" />
          ) : (
            <SymbolView
              name={{ ios: "plus", android: "add", web: "add" }}
              size={13}
              tintColor="#f97316"
            />
          )}
        </View>
      </Pressable>
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={`${formattedDate}, ${
        day.isRecorded ? "recorded" : "not recorded"
      }`}
      accessibilityState={{ selected: day.isRecorded }}
      accessibilityValue={{ text: formattedDate }}
      className="flex-1 items-center"
      testID="activity-day"
    >
      <View className="size-5 items-center justify-center">
        <View
          className={
            day.isRecorded
              ? "bg-accent size-3 rounded-full"
              : "bg-border size-2 rounded-full dark:bg-slate-700"
          }
        />
      </View>
    </View>
  );
}

function WeekdayLabels({ days }: { days: ActivityDay[] }) {
  return (
    <View className="flex-row">
      {days.map((day) => (
        <Text
          key={day.key}
          className="text-text-muted flex-1 text-center text-xs dark:text-slate-400"
        >
          {weekdayFormatter.format(day.date)}
        </Text>
      ))}
    </View>
  );
}

type RallyActivityWeekProps = {
  rallyName: string;
  stampDates: string[];
  onPressToday: () => void;
};

export function RallyActivityWeek({
  rallyName,
  stampDates,
  onPressToday,
}: RallyActivityWeekProps) {
  const activityDays = buildActivityDays(stampDates);

  return (
    <View className="w-full gap-3 pt-1" testID="activity-week">
      <WeekdayLabels days={activityDays} />
      <View className="flex-row">
        {activityDays.map((day) => (
          <ActivityDayCircle
            key={day.key}
            day={day}
            rallyName={rallyName}
            onPressToday={onPressToday}
          />
        ))}
      </View>
    </View>
  );
}
