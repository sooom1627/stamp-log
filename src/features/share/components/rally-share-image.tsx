import { type ComponentRef, type Ref } from "react";

import { Text, View } from "react-native";

import { ShareImageFrame } from "@/shared/components/share-image-frame";
import { type Rally } from "@/shared/schemas/rallies";
import { formatStampCount } from "@/shared/utils/format-stamp-count";

import { formatDateSpan } from "../utils/format-date-span";
import { rallyDotGrid } from "../utils/rally-dot-grid";

// rallyDotGrid works in pixels of the 1080 px image; the frame is laid out at a third.
const PX_PER_PT = 3;

type RallyShareImageProps = {
  ref?: Ref<ComponentRef<typeof View>>;
  rally: Rally;
  /** The rally's stamp times, any order. */
  stampedAts: string[];
};

// The rally image: the emoji and name, the count, and one dot per stamp with
// only the newest orange (docs/screens/share-image.md ラリーの画像).
export function RallyShareImage({
  ref,
  rally,
  stampedAts,
}: RallyShareImageProps) {
  const times = stampedAts.map((stampedAt) => Date.parse(stampedAt));
  const span = formatDateSpan(
    new Date(Math.min(...times)),
    new Date(Math.max(...times)),
  );
  const count = stampedAts.length;
  const { columns, cellSize } = rallyDotGrid(count);
  const cell = cellSize / PX_PER_PT;

  return (
    <ShareImageFrame
      ref={ref}
      label="Rally"
      detail={span}
      aria-label={`${rally.emoji} ${rally.name}, ${formatStampCount(count)}, ${span}`}
    >
      <View className="flex-row items-center gap-3">
        <View className="border-border bg-card-disc size-12 items-center justify-center rounded-full border">
          <Text className="text-title2">{rally.emoji}</Text>
        </View>
        <Text
          numberOfLines={2}
          className="text-foreground text-headline flex-1 font-semibold"
        >
          {rally.name}
        </Text>
      </View>
      <View className="flex-row items-baseline gap-2">
        <Text className="text-foreground text-large-title font-bold">
          {count}
        </Text>
        <Text className="text-foreground-secondary text-subhead font-semibold">
          {count === 1 ? "stamp" : "stamps"}
        </Text>
      </View>
      <View style={{ width: columns * cell }} className="flex-row flex-wrap">
        {Array.from({ length: count }, (_, index) => (
          <View
            key={index}
            style={{ width: cell, height: cell }}
            className="items-center justify-center"
          >
            <View
              testID="rally-dot"
              style={{ width: cell * 0.76, height: cell * 0.76 }}
              className={`rounded-full ${index === count - 1 ? "bg-accent" : "bg-foreground"}`}
            />
          </View>
        ))}
      </View>
    </ShareImageFrame>
  );
}
