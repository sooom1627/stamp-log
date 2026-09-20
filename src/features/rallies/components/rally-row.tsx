import { Pressable, Text, useColorScheme, View } from "react-native";

import { SymbolView } from "expo-symbols";

import { rallyTypeLabels, type RallyType } from "../schemas/rallies";

type RallyRowProps = {
  name: string;
  type: RallyType;
  stampDates: string[];
  onPressStamp: () => void;
  onDelete: () => void;
};

const rallyTypeSymbols = {
  person: { ios: "person.2.fill", android: "group", web: "group" },
  place: {
    ios: "mappin.and.ellipse",
    android: "location_on",
    web: "location_on",
  },
  action: {
    ios: "figure.walk",
    android: "directions_run",
    web: "directions_run",
  },
} as const;

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
            ? `${rallyName}は今日記録済み`
            : `${rallyName}に今日のスタンプを押す`
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

function ActivityWeek({
  days,
  rallyName,
  onPressToday,
}: {
  days: ActivityDay[];
  rallyName: string;
  onPressToday: () => void;
}) {
  return (
    <View className="flex-row">
      {days.map((day) => (
        <ActivityDayCircle
          key={day.key}
          day={day}
          rallyName={rallyName}
          onPressToday={onPressToday}
        />
      ))}
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

export function RallyRow({
  name,
  type,
  stampDates,
  onPressStamp,
  onDelete,
}: RallyRowProps) {
  const isDark = useColorScheme() === "dark";
  const activityDays = buildActivityDays(stampDates);

  return (
    <View className="border-border w-full gap-3 border-b py-4 dark:border-slate-700">
      <View className="flex-row items-center gap-3">
        <View
          accessible
          accessibilityLabel={rallyTypeLabels[type]}
          className="bg-surface-muted dark:bg-main-hover size-11 items-center justify-center rounded-2xl"
        >
          <SymbolView
            name={rallyTypeSymbols[type]}
            size={21}
            tintColor={isDark ? "#f1f5f9" : "#1e293b"}
          />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text
            selectable
            numberOfLines={1}
            className="text-main text-lg font-semibold dark:text-slate-100"
          >
            {name}
          </Text>
          <Text className="text-main-hover text-sm font-medium dark:text-slate-300">
            スタンプ {stampDates.length}個
          </Text>
        </View>
        <Pressable
          role="button"
          aria-label={`${name}を削除`}
          className="active:bg-surface-muted size-10 items-center justify-center rounded-full dark:active:bg-slate-800"
          onPress={onDelete}
        >
          <SymbolView
            name={{ ios: "trash", android: "delete", web: "delete" }}
            size={18}
            tintColor="#64748b"
          />
        </Pressable>
      </View>
      <View className="w-full gap-3 pt-1" testID="activity-week">
        <WeekdayLabels days={activityDays} />
        <ActivityWeek
          days={activityDays}
          rallyName={name}
          onPressToday={onPressStamp}
        />
      </View>
    </View>
  );
}
