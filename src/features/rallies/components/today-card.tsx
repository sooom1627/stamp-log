import { Text, View } from "react-native";

import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";

import { type Rally } from "@/shared/schemas/rallies";
import { formatSpokenMonthDay } from "@/shared/utils/format-spoken-date";
import { formatStampCount } from "@/shared/utils/format-stamp-count";
import { stampIn } from "@/shared/utils/motion";

import { stampEmojiRows } from "../utils/stamp-emoji-rows";

import { CardDisc, TopCard } from "./top-card";

// Dates on screen stay English (docs/design.md 言語).
const monthDayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

function spokenLabel(
  t: TFunction,
  rallies: Rally[],
  today: Date,
  position: string,
) {
  const date = formatSpokenMonthDay(today);
  if (rallies.length === 0) {
    return t("home.todaySpokenEmpty", { date, position });
  }
  return t("home.todaySpoken", {
    date,
    stamps: formatStampCount(rallies.length),
    names: rallies.map((rally) => rally.name).join(", "),
    position,
  });
}

// A fixed tilt per date (-4° to 4°) so a day keeps its angle across renders.
function tiltFor(date: Date) {
  return `${((date.getDate() * 7) % 9) - 4}deg`;
}

// A small tilt per emoji so overlapping emojis look pressed by hand.
const EMOJI_TILTS = ["-6deg", "5deg", "-3deg", "7deg", "-5deg"];
const EMOJI_STAMP_INS = EMOJI_TILTS.map(stampIn);

// Inked with today's rallies' emojis, overlapping, or a blank ring with the
// date. It sits in the card's disc, inside a thin ring. An emoji of a rally
// just stamped from a tile is pressed in (S-056); the others stay still.
function TodayStamp({
  rallies,
  today,
  pressedRallyIds,
}: {
  rallies: Rally[];
  today: Date;
  pressedRallyIds: ReadonlySet<Rally["id"]>;
}) {
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
      ? "text-[52px]"
      : rallies.length === 2
        ? "text-[38px]"
        : rows.length === 1
          ? "text-[30px]"
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
              <Animated.Text
                key={position}
                entering={
                  pressedRallyIds.has(rallies[position].id)
                    ? EMOJI_STAMP_INS[position]
                    : undefined
                }
                className={
                  index === 0 ? emojiClassName : `-ml-2 ${emojiClassName}`
                }
                style={{ transform: [{ rotate: EMOJI_TILTS[position] }] }}
              >
                {emoji}
              </Animated.Text>
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
  // Rallies stamped from home's tiles while it has been in view.
  pressedRallyIds: ReadonlySet<Rally["id"]>;
  today: Date;
  width: number;
  position: string;
};

// The first of home's top cards: how many rallies were stamped today and
// each of them on a row, with today's stamp in the disc. First stamped first; the card
// keeps its height however many rallies there are.
export function TodayCard({
  rallies,
  pressedRallyIds,
  today,
  width,
  position,
}: TodayCardProps) {
  const { t } = useTranslation();

  return (
    <TopCard
      label={t("home.today")}
      detail={monthDayFormatter.format(today)}
      tone="today"
      spokenLabel={spokenLabel(t, rallies, today, position)}
      width={width}
      testID="today-card"
    >
      <View className="flex-1 flex-row items-center gap-3">
        <View className="flex-1 gap-1">
          {rallies.length > 0 ? (
            <>
              <Text className="text-foreground text-lg font-semibold">
                {t("home.todayCount", {
                  stamps: formatStampCount(rallies.length),
                })}
              </Text>
              <RallyRows rallies={rallies} />
            </>
          ) : (
            <>
              <Text className="text-foreground text-lg font-semibold">
                {t("home.noStampsToday")}
              </Text>
              <Text className="text-foreground-secondary text-sm">
                {t("home.noStampsTodayBody")}
              </Text>
            </>
          )}
        </View>
        <CardDisc>
          <TodayStamp
            rallies={rallies}
            today={today}
            pressedRallyIds={pressedRallyIds}
          />
        </CardDisc>
      </View>
    </TopCard>
  );
}
