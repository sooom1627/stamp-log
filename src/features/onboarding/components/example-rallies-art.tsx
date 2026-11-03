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

import { ArtPanel, pageInDelay } from "./art-panel";

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

export function ExampleRalliesArt({ isActive }: { isActive: boolean }) {
  return (
    <ArtPanel className="justify-center gap-3.5">
      {chipRows.map((row, index) => (
        <ChipRow key={row.offset} row={row} index={index} isActive={isActive} />
      ))}
    </ArtPanel>
  );
}
