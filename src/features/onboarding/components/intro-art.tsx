import { useEffect, useState } from "react";

import { Text, View } from "react-native";

import { useTranslation } from "react-i18next";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useEntrance } from "../hooks/use-entrance";

import { ArtPanel } from "./art-panel";
import { TryStampArt } from "./try-stamp-art";

// Pictures for the four intro pages (S-047), drawn after the design canvas.
// Views, not images, so they follow the theme; they only show, never save.
// Each plays once the first time its page opens (S-054).

type ArtProps = { isActive: boolean };

// Every picture waits for the page to slide in before it moves.
const pageInDelay = 300;

const shortMonthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

// A month of dots with a few stamps, and today waiting for one.
const stampedCells = new Map([
  [7, { emoji: "🏃", rotation: -8, order: 0 }],
  [16, { emoji: "☕", rotation: 6, order: 1 }],
  [20, { emoji: "📚", rotation: -4, order: 2 }],
  [25, { emoji: "🔬", rotation: 8, order: 3 }],
  [31, { emoji: "⛰️", rotation: -6, order: 4 }],
]);
const stampGap = 140;
const todayDelay = pageInDelay + stampedCells.size * stampGap + 100;
const todayCell = 34;
const gridRows = [0, 1, 2, 3, 4, 5];

// A stamp pressed down: from a little larger and straight, to its tilt.
function PressedStamp({
  emoji,
  rotation,
  order,
  isActive,
}: {
  emoji: string;
  rotation: number;
  order: number;
  isActive: boolean;
}) {
  const progress = useEntrance(isActive, pageInDelay + order * stampGap);
  const stampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 0.4, 1], [0, 1, 1]),
    transform: [
      { rotate: `${interpolate(progress.get(), [0, 1], [0, rotation])}deg` },
      { scale: interpolate(progress.get(), [0, 1], [1.35, 1]) },
    ],
  }));

  return (
    <Animated.View
      className="bg-accent-soft size-[42px] items-center justify-center rounded-full"
      style={stampStyle}
    >
      <Text className="text-[21px]">{emoji}</Text>
    </Animated.View>
  );
}

function StampedMonthArt({ isActive }: ArtProps) {
  const today = new Date();
  const todayIn = useEntrance(isActive, todayDelay, 300);
  const todayStyle = useAnimatedStyle(() => ({ opacity: todayIn.get() }));

  return (
    <ArtPanel className="px-[22px] py-7">
      {/* Rows and cells share the space evenly, like the canvas's 6 × 6 grid. */}
      {gridRows.map((row) => (
        <View key={row} className="flex-1 flex-row">
          {gridRows.map((column) => {
            const cell = row * gridRows.length + column;
            const stamp = stampedCells.get(cell);
            return (
              <View key={cell} className="flex-1 items-center justify-center">
                {stamp ? (
                  <PressedStamp {...stamp} isActive={isActive} />
                ) : cell === todayCell ? (
                  <Animated.View
                    className="border-accent size-[42px] items-center justify-center rounded-full border-2 border-dashed"
                    style={todayStyle}
                  >
                    <Text className="text-accent-strong text-[8px] leading-[9px] font-bold tracking-wider">
                      {shortMonthFormatter.format(today).toUpperCase()}
                    </Text>
                    <Text className="text-accent-strong text-sm leading-4 font-bold">
                      {today.getDate()}
                    </Text>
                  </Animated.View>
                ) : (
                  <View className="bg-foreground-muted size-1.5 rounded-full opacity-40" />
                )}
              </View>
            );
          })}
        </View>
      ))}
    </ArtPanel>
  );
}

// Example rallies in offset rows, a few of them lit.
const chipRows = [
  {
    offset: -40,
    chips: [
      ["🔬", "onboarding.samples.researchersMet"],
      ["☕", "onboarding.samples.cafes", true],
      ["🗼", "onboarding.samples.towers"],
    ],
  },
  {
    offset: 10,
    chips: [
      ["🏃", "onboarding.samples.morningRun"],
      ["📚", "onboarding.samples.booksRead"],
      ["🍜", "onboarding.samples.ramen"],
    ],
  },
  {
    offset: -70,
    chips: [
      ["🤝", "onboarding.samples.oldFriends"],
      ["⛰️", "onboarding.samples.hikes", true],
      ["🎬", "onboarding.samples.movies"],
    ],
  },
  {
    offset: -18,
    chips: [
      ["🌊", "onboarding.samples.beaches"],
      ["🎨", "onboarding.samples.museums"],
      ["✈️", "onboarding.samples.trips"],
    ],
  },
] as const;

// The rows keep drifting sideways, slowly enough to read the page over them:
// px per second, one per row. Each row is drawn three times, wider than the
// panel, and moves by one copy before starting over, so the ends never show.
const flowSpeeds = [17, 15, 19, 16];
const rowCopies = [0, 1, 2];

type ChipRowProps = {
  row: (typeof chipRows)[number];
  index: number;
  isActive: boolean;
};

// A row slides in from one side, every other row from the other.
function ChipRow({ row, index, isActive }: ChipRowProps) {
  const { t } = useTranslation();
  const progress = useEntrance(isActive, pageInDelay + index * 70, 500);
  const from = index % 2 === 0 ? -28 : 28;
  const rowStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ translateX: interpolate(progress.get(), [0, 1], [from, 0]) }],
  }));
  const [copyWidth, setCopyWidth] = useState(0);
  const flow = useSharedValue(0);
  const flowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: flow.get() }],
  }));

  // Every other row drifts the other way. With Reduce Motion on, the loop
  // runs once to its end, one copy along, which looks like the start.
  useEffect(() => {
    if (!copyWidth) return;
    const [start, end] = index % 2 === 0 ? [0, -copyWidth] : [-copyWidth, 0];
    const duration = (copyWidth / flowSpeeds[index]) * 1000;
    flow.set(
      withRepeat(
        withSequence(
          withTiming(start, { duration: 0 }),
          withTiming(end, { duration, easing: Easing.linear }),
        ),
        -1,
      ),
    );
  }, [copyWidth, index, flow]);

  return (
    <Animated.View style={[{ marginLeft: row.offset }, rowStyle]}>
      <Animated.View className="flex-row" style={flowStyle}>
        {rowCopies.map((copy) => (
          // Only the first copy is read out; the others repeat it.
          <View
            key={copy}
            aria-hidden={copy > 0}
            className="flex-row gap-2.5 pr-2.5"
            onLayout={
              copy === 0
                ? ({ nativeEvent }) => setCopyWidth(nativeEvent.layout.width)
                : undefined
            }
          >
            {row.chips.map(([emoji, name, isLit]) => (
              <View
                key={name}
                className={`h-[46px] flex-row items-center gap-2 rounded-full pr-4 pl-1.5 ${
                  isLit ? "bg-accent-subtle" : "bg-surface-muted"
                }`}
              >
                <View className="bg-accent-soft size-[34px] items-center justify-center rounded-full">
                  <Text className="text-lg">{emoji}</Text>
                </View>
                <Text className="text-foreground text-[15px] font-semibold">
                  {t(name)}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </Animated.View>
    </Animated.View>
  );
}

function ExampleRalliesArt({ isActive }: ArtProps) {
  return (
    <ArtPanel className="justify-center gap-3.5">
      {chipRows.map((row, index) => (
        <ChipRow key={row.offset} row={row} index={index} isActive={isActive} />
      ))}
    </ArtPanel>
  );
}

// One rally's stamps by date. The gaps between them are only space: no
// streak, no count of missed days.
const hikes = [
  { date: "Aug 3", memo: "onboarding.samples.hikeMemo1", gapBefore: 0 },
  { date: "Aug 17", memo: "onboarding.samples.hikeMemo2", gapBefore: 10 },
  { date: "Sep 28", memo: "onboarding.samples.hikeMemo3", gapBefore: 44 },
  { date: "Oct 25", memo: "onboarding.samples.hikeMemo4", gapBefore: 22 },
] as const;

const hikeGap = 200;

// One stamp on the trail, coming in by date: the line above it grows down,
// then the stamp and its memo show.
function HikeEntry({
  hike,
  index,
  isActive,
}: {
  hike: (typeof hikes)[number];
  index: number;
  isActive: boolean;
}) {
  const { t } = useTranslation();
  const progress = useEntrance(isActive, pageInDelay + index * hikeGap, 300);
  const lineStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleY: interpolate(progress.get(), [0, 0.5], [0, 1], "clamp") },
    ],
  }));
  const stampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0.3, 1], [0, 1], "clamp"),
    transform: [
      { scale: interpolate(progress.get(), [0.3, 1], [0.6, 1], "clamp") },
    ],
  }));
  const memoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0.5, 1], [0, 1], "clamp"),
  }));
  const isFirst = index === 0;
  const isLast = index === hikes.length - 1;

  return (
    <View>
      {hike.gapBefore ? (
        <View className="flex-row" style={{ height: hike.gapBefore }}>
          <View className="w-13" />
          <View className="w-[34px] items-center">
            <Animated.View
              className="bg-border w-0.5 flex-1"
              style={[{ transformOrigin: "top" }, lineStyle]}
            />
          </View>
        </View>
      ) : null}
      <View className="flex-row gap-0">
        <Text className="text-foreground-muted w-13 pt-[17px] text-[13px] font-medium">
          {hike.date}
        </Text>
        <View className="w-[34px] items-center">
          <Animated.View
            className={`h-2 w-0.5 ${isFirst ? "" : "bg-border"}`}
            style={[{ transformOrigin: "top" }, lineStyle]}
          />
          <Animated.View
            className="bg-accent-soft size-[34px] items-center justify-center rounded-full"
            style={stampStyle}
          >
            <Text className="text-lg">⛰️</Text>
          </Animated.View>
          <Animated.View
            className={`w-0.5 flex-1 ${isLast ? "" : "bg-border"}`}
            style={[{ transformOrigin: "top" }, memoStyle]}
          />
        </View>
        <Animated.Text
          className="text-foreground-secondary flex-1 pt-[17px] pl-3 text-sm"
          style={memoStyle}
        >
          {t(hike.memo)}
        </Animated.Text>
      </View>
    </View>
  );
}

function QuietTrailArt({ isActive }: ArtProps) {
  const { t } = useTranslation();

  return (
    <ArtPanel className="gap-4 px-5 py-[22px]">
      <View className="flex-row items-center gap-3">
        <View className="bg-accent-soft border-continuous size-12 items-center justify-center rounded-[14px]">
          <Text className="text-[26px]">⛰️</Text>
        </View>
        <View>
          <Text className="text-foreground text-[17px] font-semibold">
            {t("onboarding.samples.hikes")}
          </Text>
          <Text className="text-foreground-muted text-sm">4 stamps</Text>
        </View>
      </View>
      <View className="bg-border h-px" />
      <View>
        {hikes.map((hike, index) => (
          <HikeEntry
            key={hike.date}
            hike={hike}
            index={index}
            isActive={isActive}
          />
        ))}
      </View>
    </ArtPanel>
  );
}

export const introArt = [
  StampedMonthArt,
  ExampleRalliesArt,
  TryStampArt,
  QuietTrailArt,
] as const;
