import { Text, View } from "react-native";

import { formatStampCount } from "@/shared/utils/format-stamp-count";

import { type Rally } from "../schemas/rallies";
import { stampEmojiRows } from "../utils/stamp-emoji-rows";

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

// A small tilt per emoji so overlapping emojis look pressed by hand.
const EMOJI_TILTS = ["-6deg", "5deg", "-3deg", "7deg", "-5deg"];

// Inked with today's rallies' emojis, overlapping, or a blank ring with the date.
function TodayStamp({ rallies, today }: { rallies: Rally[]; today: Date }) {
  if (rallies.length === 0) {
    return (
      <View
        className="size-22 items-center justify-center"
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

  const { rows, moreCount } = stampEmojiRows(
    rallies.map((rally) => rally.emoji),
  );
  const emojiClassName =
    rallies.length === 1
      ? "text-4xl"
      : rows.length === 1
        ? "text-2xl"
        : "text-xl";
  return (
    <View
      className="border-accent bg-background size-22 items-center justify-center rounded-full border-[1.5px]"
      style={{ transform: [{ rotate: tiltFor(today) }] }}
      testID="today-stamp"
    >
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          className={
            rowIndex === 0
              ? "flex-row items-center"
              : "-mt-2 flex-row items-center"
          }
          testID="today-stamp-row"
        >
          {row.map((emoji, index) => {
            const position = rowIndex * 3 + index;
            return (
              <Text
                key={position}
                className={
                  index === 0 ? emojiClassName : `-ml-2 ${emojiClassName}`
                }
                style={{ transform: [{ rotate: EMOJI_TILTS[position] }] }}
              >
                {emoji}
              </Text>
            );
          })}
          {rowIndex === rows.length - 1 && moreCount > 0 ? (
            <Text className="text-accent-strong ml-0.5 text-xs font-bold">
              {`+${moreCount}`}
            </Text>
          ) : null}
        </View>
      ))}
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
      className="bg-accent-subtle border-continuous mb-4 h-26 flex-row items-center gap-3 rounded-3xl pr-4 pl-2.5"
      testID="today-card"
    >
      <TodayStamp rallies={rallies} today={today} />
      {rallies.length > 0 ? (
        <View className="flex-1 gap-1">
          <Text className="text-foreground text-base font-semibold">
            {`${formatStampCount(rallies.length)} today`}
          </Text>
          <Text className="text-foreground-secondary text-sm" numberOfLines={2}>
            {rallies.map((rally) => rally.name).join(" · ")}
          </Text>
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
