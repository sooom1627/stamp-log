import { useEffect, useState } from "react";

import { Pressable, Text, useColorScheme, View } from "react-native";

import { SymbolView } from "expo-symbols";

import Animated, {
  Easing,
  FadeInDown,
  FadeOut,
  LinearTransition,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { type RallyType } from "../schemas/rallies";

type RallyRowProps = {
  name: string;
  type: RallyType;
  typeLabel: string;
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
const easeOut = Easing.bezier(0.23, 1, 0.32, 1);

type ActivityDay = {
  date: Date;
  key: string;
  isRecorded: boolean;
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

  return Array.from({ length: 28 }, (_, index): ActivityDay => {
    const date = new Date(localToday);
    date.setDate(localToday.getDate() - (27 - index));
    const key = localDateKey(date);
    return { date, key, isRecorded: recordedDateKeys.has(key) };
  });
}

function ActivityDayCircle({ day }: { day: ActivityDay }) {
  const formattedDate = activityDateFormatter.format(day.date);

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
      <View
        className={
          day.isRecorded
            ? "bg-accent size-4 rounded-full"
            : "bg-border size-4 rounded-full dark:bg-slate-700"
        }
      />
    </View>
  );
}

function ActivityWeek({ days }: { days: ActivityDay[] }) {
  return (
    <View className="flex-row">
      {days.map((day) => (
        <ActivityDayCircle key={day.key} day={day} />
      ))}
    </View>
  );
}

export function RallyRow({
  name,
  type,
  typeLabel,
  stampDates,
  onPressStamp,
  onDelete,
}: RallyRowProps) {
  const isDark = useColorScheme() === "dark";
  const [isExpanded, setIsExpanded] = useState(false);
  const chevronRotation = useSharedValue(0);
  const activityDays = buildActivityDays(stampDates);
  const previousDays = activityDays.slice(0, 21);
  const recentDays = activityDays.slice(21);
  const previousWeeks = [
    previousDays.slice(0, 7),
    previousDays.slice(7, 14),
    previousDays.slice(14, 21),
  ];
  const entering = FadeInDown.duration(180)
    .easing(easeOut)
    .reduceMotion(ReduceMotion.System);
  const rowLayout = LinearTransition.duration(180)
    .easing(easeOut)
    .reduceMotion(ReduceMotion.System);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.get()}deg` }],
  }));

  useEffect(() => {
    chevronRotation.set(
      withTiming(isExpanded ? 180 : 0, {
        duration: 150,
        easing: easeOut,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [chevronRotation, isExpanded]);

  return (
    <Animated.View
      className="border-border w-full gap-4 border-b py-5 dark:border-slate-700"
      layout={rowLayout}
    >
      <View className="flex-row items-center gap-3">
        <View className="bg-surface-muted dark:bg-main-hover size-11 items-center justify-center rounded-2xl">
          <SymbolView
            name={rallyTypeSymbols[type]}
            size={21}
            tintColor={isDark ? "#f1f5f9" : "#1e293b"}
          />
        </View>
        <View className="flex-1 gap-1">
          <Text
            selectable
            className="text-main text-lg font-semibold dark:text-slate-100"
          >
            {name}
          </Text>
          <Text className="text-text-muted text-sm dark:text-slate-400">
            {typeLabel}
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
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-row items-center gap-2">
          <View className="bg-accent size-1.5 rounded-full" />
          <Text className="text-main-hover text-sm font-medium dark:text-slate-300">
            スタンプ {stampDates.length}個
          </Text>
        </View>
        <Pressable
          role="button"
          aria-label={`${name}にスタンプを押す`}
          className="bg-main active:bg-main-hover dark:bg-main-hover flex-row items-center gap-1.5 rounded-full px-4 py-2.5"
          onPress={onPressStamp}
        >
          <SymbolView
            name={{ ios: "plus", android: "add", web: "add" }}
            size={16}
            tintColor="#ffffff"
          />
          <Text className="font-semibold text-white">押す</Text>
        </Pressable>
      </View>
      <View className="bg-surface-muted dark:bg-main-hover gap-3 rounded-2xl p-3">
        <Pressable
          role="button"
          accessibilityLabel={
            isExpanded ? "Show last 7 days" : "Show last 4 weeks"
          }
          accessibilityState={{ expanded: isExpanded }}
          className="min-h-11 flex-row items-center justify-between"
          onPress={() => setIsExpanded((current) => !current)}
        >
          <Text className="text-main-hover text-sm font-semibold dark:text-slate-200">
            {isExpanded ? "Last 4 weeks" : "Last 7 days"}
          </Text>
          <Animated.View style={chevronStyle}>
            <SymbolView
              name={{
                ios: "chevron.down",
                android: "expand_more",
                web: "expand_more",
              }}
              size={16}
              tintColor={isDark ? "#cbd5e1" : "#475569"}
            />
          </Animated.View>
        </Pressable>
        <View className="flex-row">
          {recentDays.map((day) => (
            <Text
              key={day.key}
              className="text-text-muted flex-1 text-center text-xs dark:text-slate-400"
            >
              {weekdayFormatter.format(day.date)}
            </Text>
          ))}
        </View>
        {isExpanded ? (
          <Animated.View
            className="gap-3"
            entering={entering}
            exiting={FadeOut.duration(120).reduceMotion(ReduceMotion.System)}
          >
            {previousWeeks.map((week) => (
              <ActivityWeek key={week[0].key} days={week} />
            ))}
          </Animated.View>
        ) : null}
        <ActivityWeek days={recentDays} />
      </View>
    </Animated.View>
  );
}
