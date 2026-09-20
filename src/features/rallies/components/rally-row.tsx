import { Pressable, Text, useColorScheme, View } from "react-native";

import { SymbolView } from "expo-symbols";

import { type RallyType } from "../schemas/rallies";

type StampLabel = {
  id: number;
  label: string;
  memo: string | null;
};

type RallyRowProps = {
  name: string;
  type: RallyType;
  typeLabel: string;
  stampCount: number;
  stampLabels: StampLabel[];
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

export function RallyRow({
  name,
  type,
  typeLabel,
  stampCount,
  stampLabels,
  onPressStamp,
  onDelete,
}: RallyRowProps) {
  const isDark = useColorScheme() === "dark";
  const recentStampLabels = stampLabels.slice(0, 3);

  return (
    <View className="border-border w-full gap-4 border-b py-5 dark:border-slate-700">
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
            スタンプ {stampCount}個
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
      {recentStampLabels.length > 0 ? (
        <View className="bg-surface-muted dark:bg-main-hover gap-2 rounded-2xl p-3">
          {recentStampLabels.map((stamp) => (
            <View key={stamp.id} className="flex-row items-center gap-2">
              <SymbolView
                name={{ ios: "clock", android: "schedule", web: "schedule" }}
                size={14}
                tintColor="#f97316"
              />
              <Text className="text-text-muted text-sm dark:text-slate-400">
                {stamp.label}
              </Text>
              {stamp.memo ? (
                <Text
                  className="text-main-hover flex-1 text-sm dark:text-slate-200"
                  numberOfLines={1}
                >
                  {stamp.memo}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
