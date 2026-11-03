import { Text, View } from "react-native";

import { useTranslation } from "react-i18next";
import Animated, {
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

import { useEntrance } from "../hooks/use-entrance";

import { ArtPanel, pageInDelay } from "./art-panel";

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

export function QuietTrailArt({ isActive }: { isActive: boolean }) {
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
