import { type ComponentRef, type Ref } from "react";

import { Text, View } from "react-native";

import { MonthStampGrid } from "@/shared/components/month-stamp-grid";
import { ShareImageFrame } from "@/shared/components/share-image-frame";
import { formatRallyCount } from "@/shared/utils/format-rally-count";
import { formatStampCount } from "@/shared/utils/format-stamp-count";
import { type MonthShare } from "@/shared/utils/month-share-grid";

const monthNameFormatter = new Intl.DateTimeFormat("en-US", { month: "long" });

type MonthShareImageProps = {
  ref?: Ref<ComponentRef<typeof View>>;
  month: Date;
  share: MonthShare;
};

// The month image: the count, the grid of rallies by days, and the list of
// rallies (docs/screens/share-image.md 月の画像).
export function MonthShareImage({ ref, month, share }: MonthShareImageProps) {
  const monthName = monthNameFormatter.format(month);
  const year = String(month.getFullYear());

  return (
    <ShareImageFrame
      ref={ref}
      label={monthName}
      detail={year}
      aria-label={`${monthName} ${year}, ${formatStampCount(share.stampCount)}, ${formatRallyCount(share.rallyCount)}`}
    >
      <View className="gap-1">
        <View className="flex-row items-baseline gap-2">
          <Text className="text-foreground text-large-title font-bold">
            {share.stampCount}
          </Text>
          <Text className="text-foreground-secondary text-subhead font-semibold">
            {share.stampCount === 1 ? "stamp" : "stamps"}
          </Text>
        </View>
        <Text className="text-foreground-muted text-subhead">
          {formatRallyCount(share.rallyCount)}
        </Text>
      </View>
      <MonthStampGrid month={month} share={share} showDays />
      <View
        testID="month-share-list"
        className="border-border gap-1 border-t pt-3"
      >
        {share.rows.map(({ rally, count }) => (
          <View key={rally.id} className="flex-row items-center gap-2">
            <Text className="text-footnote">{rally.emoji}</Text>
            <Text
              numberOfLines={1}
              className="text-foreground text-footnote flex-1"
            >
              {rally.name}
            </Text>
            <Text className="text-foreground-secondary text-footnote font-semibold">
              {count}
            </Text>
          </View>
        ))}
        {share.rest ? (
          <Text className="text-foreground-muted text-footnote">
            {`+${formatRallyCount(share.rest.rallyCount)} · ${formatStampCount(share.rest.stampCount)}`}
          </Text>
        ) : null}
      </View>
    </ShareImageFrame>
  );
}
