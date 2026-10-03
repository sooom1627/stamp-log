import { Pressable, Text, View } from "react-native";

import { ChevronRight } from "@/shared/components/icons";

import { RallyActivityWeek } from "./rally-activity-week";

type RallyRowProps = {
  name: string;
  emoji: string;
  stampDates: string[];
  onPressStamp: () => void;
  onPressDetail: () => void;
};

export function RallyRow({
  name,
  emoji,
  stampDates,
  onPressStamp,
  onPressDetail,
}: RallyRowProps) {
  return (
    <View className="border-border w-full gap-3 border-b py-4">
      <Pressable
        role="button"
        aria-label={`View ${name} details`}
        className="flex-row items-center gap-3 active:opacity-70"
        onPress={onPressDetail}
      >
        <View className="bg-surface-muted border-continuous size-11 items-center justify-center rounded-2xl">
          <Text className="text-2xl">{emoji}</Text>
        </View>
        <View className="min-w-0 flex-1 gap-0.5">
          <View className="min-w-0 flex-row items-center justify-start gap-1">
            <Text
              selectable
              numberOfLines={1}
              className="text-foreground min-w-0 text-base font-semibold"
            >
              {name}
            </Text>
            <ChevronRight
              colorClassName="accent-text-muted"
              size={14}
              strokeWidth={2}
            />
          </View>
          <Text className="text-foreground-secondary text-sm font-medium">
            {stampDates.length} stamps
          </Text>
        </View>
      </Pressable>
      <RallyActivityWeek
        rallyName={name}
        stampDates={stampDates}
        onPressToday={onPressStamp}
      />
    </View>
  );
}
