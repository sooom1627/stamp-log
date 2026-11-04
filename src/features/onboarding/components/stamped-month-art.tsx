import { Text, View } from "react-native";

import Animated, {
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

import { useEntrance } from "../hooks/use-entrance";

import { ArtPanel, pageInDelay } from "./art-panel";

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

export function StampedMonthArt({ isActive }: { isActive: boolean }) {
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
