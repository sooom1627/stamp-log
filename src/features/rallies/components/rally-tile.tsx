import { Pressable, Text, View } from "react-native";

import { Check, Plus } from "@/shared/components/icons";
import { formatStampCount } from "@/shared/utils/format-stamp-count";
import { localDateKey } from "@/shared/utils/local-date-key";

import { RallyActivityWeek } from "./rally-activity-week";

type RallyTileProps = {
  name: string;
  emoji: string;
  stampDates: string[];
  width?: number;
  onPressStamp: () => void;
  onPressDetail: () => void;
};

export function RallyTile({
  name,
  emoji,
  stampDates,
  width,
  onPressStamp,
  onPressDetail,
}: RallyTileProps) {
  const todayKey = localDateKey(new Date());
  const isStampedToday = stampDates.some(
    (stampDate) => localDateKey(new Date(stampDate)) === todayKey,
  );

  return (
    <View
      className="bg-surface-muted border-continuous gap-3 rounded-3xl p-3.5"
      style={{ width }}
      testID="rally-tile"
    >
      <View className="flex-row items-start justify-between">
        <View className="bg-accent-soft border-continuous size-11 items-center justify-center rounded-2xl">
          <Text className="text-2xl">{emoji}</Text>
        </View>
        <Pressable
          role="button"
          aria-label={
            isStampedToday
              ? `${name} already stamped today`
              : `Stamp ${name} for today`
          }
          aria-disabled={isStampedToday}
          disabled={isStampedToday}
          // 32px visually; the hit area stays 44px.
          hitSlop={6}
          className={
            isStampedToday
              ? "bg-accent size-8 items-center justify-center rounded-full"
              : "border-accent size-8 items-center justify-center rounded-full border-[1.5px] active:opacity-70"
          }
          onPress={onPressStamp}
        >
          {isStampedToday ? (
            <Check colorClassName="accent-white" size={16} strokeWidth={3} />
          ) : (
            <Plus colorClassName="accent-accent" size={16} strokeWidth={2.5} />
          )}
        </Pressable>
      </View>
      <Pressable
        role="button"
        aria-label={`View ${name} details`}
        className="gap-1 active:opacity-70"
        onPress={onPressDetail}
      >
        <Text
          numberOfLines={2}
          className="text-foreground min-h-10 text-base leading-5 font-semibold"
        >
          {name}
        </Text>
        <Text className="text-foreground-muted text-sm font-medium">
          {formatStampCount(stampDates.length)}
        </Text>
      </Pressable>
      <RallyActivityWeek stampDates={stampDates} />
    </View>
  );
}
