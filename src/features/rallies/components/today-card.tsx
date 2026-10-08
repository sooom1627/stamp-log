import { useState } from "react";

import { Text, View, type LayoutChangeEvent } from "react-native";

import { formatStampCount } from "@/shared/utils/format-stamp-count";

import { type Rally } from "../schemas/rallies";
import { countFittingChips } from "../utils/count-fitting-chips";

const MAX_STAMP_EMOJIS = 3;
// Matches the chip row's gap-1.5.
const CHIP_GAP = 6;

const spokenDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

function spokenLabel(rallies: Rally[], today: Date) {
  const date = `Today, ${spokenDateFormatter.format(today)}`;
  if (rallies.length === 0) return `${date}, no stamps yet`;
  const names = rallies.map((rally) => rally.name).join(", ");
  return `${date}, ${formatStampCount(rallies.length)}: ${names}`;
}

// A fixed tilt per date (-4° to 4°) so a day keeps its angle across renders.
function tiltFor(date: Date) {
  return `${((date.getDate() * 7) % 9) - 4}deg`;
}

// Inked with the emojis of today's rallies, or a blank ring with the date.
function TodayStamp({ rallies, today }: { rallies: Rally[]; today: Date }) {
  if (rallies.length === 0) {
    return (
      <View
        className="size-20 items-center justify-center"
        testID="today-stamp"
      >
        <View className="border-foreground-muted absolute inset-0 rounded-full border-[1.5px] border-dashed opacity-40" />
        <Text className="text-foreground-muted text-[10px] font-bold tracking-widest">
          {monthFormatter.format(today).toUpperCase()}
        </Text>
        <Text className="text-foreground-muted text-3xl leading-8 font-bold">
          {today.getDate()}
        </Text>
      </View>
    );
  }

  const emojis = rallies
    .slice(0, MAX_STAMP_EMOJIS)
    .map((rally) => ({ id: rally.id, emoji: rally.emoji }));
  return (
    <View
      className="border-accent bg-background size-20 flex-row items-center justify-center rounded-full border-[1.5px]"
      style={{ transform: [{ rotate: tiltFor(today) }] }}
      testID="today-stamp"
    >
      {emojis.map(({ id, emoji }, index) => (
        <Text
          key={id}
          className={
            emojis.length === 1
              ? "text-3xl"
              : index === 0
                ? "text-xl"
                : "-ml-2 text-xl"
          }
        >
          {emoji}
        </Text>
      ))}
    </View>
  );
}

function RallyChip({ rally, testID }: { rally: Rally; testID: string }) {
  return (
    <View
      className="bg-background flex-row items-center gap-1 rounded-full py-1 pr-2.5 pl-1.5"
      testID={testID}
    >
      <Text className="text-sm">{rally.emoji}</Text>
      <Text className="text-foreground-secondary text-sm" numberOfLines={1}>
        {rally.name}
      </Text>
    </View>
  );
}

function MoreChip({ count, testID }: { count: number; testID?: string }) {
  return (
    <View className="bg-background rounded-full px-2.5 py-1" testID={testID}>
      <Text className="text-foreground-secondary text-sm font-semibold">
        {`+${count}`}
      </Text>
    </View>
  );
}

// One row of chips: as many as fit, then "+N" for the rest. Chips are
// measured in a hidden copy of the row; until then, all of them show.
function TodayRallyChips({ rallies }: { rallies: Rally[] }) {
  const [rowWidth, setRowWidth] = useState(0);
  const [chipWidths, setChipWidths] = useState<Record<number, number>>({});
  const [moreWidth, setMoreWidth] = useState(0);

  const widths = rallies.map((rally) => chipWidths[rally.id]);
  const isMeasured =
    rowWidth > 0 && moreWidth > 0 && widths.every((width) => width > 0);
  const visibleCount = isMeasured
    ? countFittingChips(widths, rowWidth, CHIP_GAP, moreWidth)
    : rallies.length;
  const hiddenCount = rallies.length - visibleCount;

  const measureChip = (rallyId: number) => (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setChipWidths((current) => ({ ...current, [rallyId]: width }));
  };

  return (
    <View
      className="flex-row gap-1.5 overflow-hidden"
      onLayout={(event) => setRowWidth(event.nativeEvent.layout.width)}
      testID="today-rallies"
    >
      <View
        aria-hidden
        className="absolute flex-row gap-1.5 opacity-0"
        pointerEvents="none"
      >
        {rallies.map((rally) => (
          <View key={rally.id} onLayout={measureChip(rally.id)}>
            <RallyChip rally={rally} testID="today-rally-measure" />
          </View>
        ))}
        <View
          onLayout={(event) => setMoreWidth(event.nativeEvent.layout.width)}
        >
          <MoreChip count={rallies.length} testID="today-more-measure" />
        </View>
      </View>
      {rallies.slice(0, visibleCount).map((rally) => (
        <RallyChip key={rally.id} rally={rally} testID="today-rally" />
      ))}
      {hiddenCount > 0 ? <MoreChip count={hiddenCount} /> : null}
    </View>
  );
}

type TodayCardProps = {
  rallies: Rally[];
  today: Date;
};

// Today's stamp with the rallies stamped today, first stamped first. The
// card keeps the stamp's height however many rallies there are.
export function TodayCard({ rallies, today }: TodayCardProps) {
  return (
    <View
      accessible
      aria-label={spokenLabel(rallies, today)}
      className="bg-accent-subtle border-continuous mb-4 h-28 flex-row items-center gap-4 rounded-3xl px-5"
      testID="today-card"
    >
      <TodayStamp rallies={rallies} today={today} />
      {rallies.length > 0 ? (
        <View className="flex-1 gap-2">
          <Text className="text-foreground text-base font-semibold">
            {`${formatStampCount(rallies.length)} today`}
          </Text>
          <TodayRallyChips rallies={rallies} />
        </View>
      ) : (
        <View className="flex-1 gap-1">
          <Text className="text-foreground text-base font-semibold">
            No stamps yet today
          </Text>
          <Text className="text-foreground-secondary text-sm">
            What you stamp today shows up here.
          </Text>
        </View>
      )}
    </View>
  );
}
