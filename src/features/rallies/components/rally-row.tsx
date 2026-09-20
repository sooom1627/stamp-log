import { Pressable, Text, View } from "react-native";

import { SymbolView } from "expo-symbols";

import { RallyActivityWeek } from "./rally-activity-week";

type RallyRowProps = {
  name: string;
  emoji: string;
  stampDates: string[];
  onPressStamp: () => void;
  onDelete: () => void;
};

export function RallyRow({
  name,
  emoji,
  stampDates,
  onPressStamp,
  onDelete,
}: RallyRowProps) {
  return (
    <View className="border-border w-full gap-3 border-b py-4 dark:border-slate-700">
      <View className="flex-row items-center gap-3">
        <View className="bg-surface-muted dark:bg-main-hover size-11 items-center justify-center rounded-2xl">
          <Text className="text-2xl">{emoji}</Text>
        </View>
        <View className="min-w-0 flex-1 gap-0.5">
          <Text
            selectable
            numberOfLines={1}
            className="text-main text-lg font-semibold dark:text-slate-100"
          >
            {name}
          </Text>
          <Text className="text-main-hover text-sm font-medium dark:text-slate-300">
            {stampDates.length} stamps
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
      <RallyActivityWeek
        rallyName={name}
        stampDates={stampDates}
        onPressToday={onPressStamp}
      />
    </View>
  );
}
