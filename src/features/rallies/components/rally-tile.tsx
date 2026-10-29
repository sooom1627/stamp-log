import { Pressable, Text, View } from "react-native";

import { Link } from "expo-router";

import { Check, Plus, Star } from "@/shared/components/icons";
import { type Rally } from "@/shared/schemas/rallies";
import { formatStampCount } from "@/shared/utils/format-stamp-count";
import { buildLastDays } from "@/shared/utils/month-grid";

import { RallyActivityWeek } from "./rally-activity-week";

type RallyTileProps = {
  rallyId: Rally["id"];
  name: string;
  emoji: string;
  isFavorite?: boolean;
  // At least the last 7 days; older ones are not needed.
  stampDates: string[];
  // Every stamp of the rally.
  stampCount: number;
  width?: number;
  // Without it, the tile has no stamp button.
  onPressStamp?: () => void;
};

export function RallyTile({
  rallyId,
  name,
  emoji,
  isFavorite = false,
  stampDates,
  stampCount,
  width,
  onPressStamp,
}: RallyTileProps) {
  const activityDays = buildLastDays(stampDates, new Date());
  // The last of the 7 days is today.
  const isStampedToday = activityDays[activityDays.length - 1].isRecorded;

  return (
    <View
      className="bg-surface border-continuous gap-3 rounded-[28px] p-4"
      style={{ width }}
      testID="rally-tile"
    >
      <View className="flex-row items-start justify-between">
        <View className="bg-surface-muted border-continuous size-11 items-center justify-center rounded-2xl">
          <Text className="text-2xl">{emoji}</Text>
          {isFavorite ? (
            // Quiet on purpose: people know their favorites; the mark only
            // explains why the tile sits first.
            <View
              role="img"
              aria-label="Favorite"
              className="bg-surface absolute -right-1 -bottom-1 size-[18px] items-center justify-center rounded-full"
            >
              <Star
                colorClassName="accent-foreground-muted"
                fillClassName="accent-foreground-muted"
                size={11}
              />
            </View>
          ) : null}
        </View>
        {onPressStamp ? (
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
                : "bg-surface-muted size-8 items-center justify-center rounded-full active:opacity-70"
            }
            onPress={onPressStamp}
          >
            {isStampedToday ? (
              <Check colorClassName="accent-white" size={16} strokeWidth={3} />
            ) : (
              <Plus
                colorClassName="accent-foreground"
                size={16}
                strokeWidth={2.5}
              />
            )}
          </Pressable>
        ) : null}
      </View>
      <Link
        href={{ pathname: "/rallies/[id]", params: { id: rallyId } }}
        asChild
      >
        <Pressable
          role="button"
          aria-label={`View ${name} details`}
          // Takes the spare height so the name and count stay together and
          // the dots sit at the bottom of every tile in the row.
          className="flex-1 gap-1 active:opacity-70"
        >
          <Text
            numberOfLines={1}
            className="text-foreground text-[15px] leading-5 font-semibold"
          >
            {name}
          </Text>
          <Text className="text-foreground-muted text-[13px] font-medium">
            {formatStampCount(stampCount)}
          </Text>
        </Pressable>
      </Link>
      <RallyActivityWeek activityDays={activityDays} />
    </View>
  );
}
