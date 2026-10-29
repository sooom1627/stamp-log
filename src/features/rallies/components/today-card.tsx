import { Text, View } from "react-native";

import { type Rally } from "@/shared/schemas/rallies";
import { formatStampCount } from "@/shared/utils/format-stamp-count";

import { stampEmojiRows } from "../utils/stamp-emoji-rows";

import { CardDisc, TopCard } from "./top-card";

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

// Inked with today's rallies' emojis, overlapping, or a blank ring with the
// date. It sits in the card's disc, inside a thin ring.
function TodayStamp({ rallies, today }: { rallies: Rally[]; today: Date }) {
  if (rallies.length === 0) {
    return (
      <View
        className="absolute inset-1.25 items-center justify-center"
        testID="today-stamp"
      >
        <View className="border-foreground-muted absolute inset-0 rounded-full border border-dashed opacity-40" />
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
  // The fewer the emojis, the larger, so a day with one or two stamps still
  // fills the disc (S-053).
  const emojiClassName =
    rallies.length === 1
      ? "text-[40px]"
      : rallies.length === 2
        ? "text-[30px]"
        : rows.length === 1
          ? "text-[26px]"
          : "text-xl";
  return (
    <View
      className="border-accent/50 absolute inset-1.25 items-center justify-center rounded-full border"
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

// Rows shown on the left before the rest are counted as "+N"; three rows keep
// the card at the other cards' height.
const MAX_ROWS = 3;

// Today's rallies one per row, emoji and name. Past three, two rows and +N.
function RallyRows({ rallies }: { rallies: Rally[] }) {
  const shown =
    rallies.length > MAX_ROWS ? rallies.slice(0, MAX_ROWS - 1) : rallies;
  const moreCount = rallies.length - shown.length;

  return (
    <View className="gap-0.5">
      {shown.map((rally) => (
        <View
          key={rally.id}
          className="flex-row items-center gap-2"
          testID="today-rally-row"
        >
          <Text className="text-sm">{rally.emoji}</Text>
          <Text
            className="text-foreground-secondary flex-1 text-sm"
            numberOfLines={1}
          >
            {rally.name}
          </Text>
        </View>
      ))}
      {moreCount > 0 ? (
        <View className="flex-row" testID="today-rally-row">
          <Text className="text-foreground-muted text-sm">{`+${moreCount}`}</Text>
        </View>
      ) : null}
    </View>
  );
}

type TodayCardProps = {
  rallies: Rally[];
  today: Date;
  width: number;
  position: string;
};

// The first of home's top cards: how many rallies were stamped today and
// each of them on a row, with today's stamp in the disc. First stamped first; the card
// keeps its height however many rallies there are.
export function TodayCard({ rallies, today, width, position }: TodayCardProps) {
  return (
    <TopCard
      label="Today"
      detail={spokenDateFormatter.format(today)}
      tone="today"
      spokenLabel={`${spokenLabel(rallies, today)}, ${position}`}
      width={width}
      testID="today-card"
    >
      <View className="flex-1 flex-row items-center gap-3">
        <View className="flex-1 gap-1">
          {rallies.length > 0 ? (
            <>
              <Text className="text-foreground text-lg font-semibold">
                {`${formatStampCount(rallies.length)} today`}
              </Text>
              <RallyRows rallies={rallies} />
            </>
          ) : (
            <>
              <Text className="text-foreground text-lg font-semibold">
                No stamps yet today
              </Text>
              <Text className="text-foreground-secondary text-sm">
                What you stamp today shows up here.
              </Text>
            </>
          )}
        </View>
        <CardDisc>
          <TodayStamp rallies={rallies} today={today} />
        </CardDisc>
      </View>
    </TopCard>
  );
}
