import { useState } from "react";

import { Pressable, Text, View } from "react-native";

import { useTranslation } from "react-i18next";
import Animated, {
  FadeInDown,
  Keyframe,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Check, Plus } from "@/shared/components/icons";

import { easeOut } from "../utils/motion";

import { ArtPanel } from "./art-panel";

const weekLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// A tile to try the stamp button on; the toast answers like the app's.
const stampedBefore = [false, true, false, true, true, false];

// Today's dot swells as it fills, then settles.
const dotPop = new Keyframe({
  0: { transform: [{ scale: 0.4 }] },
  60: { transform: [{ scale: 1.6 }], easing: easeOut },
  100: { transform: [{ scale: 1 }], easing: easeOut },
}).duration(360);

export function TryStampArt() {
  const [isStamped, setIsStamped] = useState(false);
  const { t } = useTranslation();
  const name = t("onboarding.samples.morningRun");
  const days = [...stampedBefore, isStamped];
  const buttonScale = useSharedValue(1);
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.get() }],
  }));

  function toggleStamp() {
    // Only stamping answers with a press; taking it back is quiet.
    if (!isStamped) {
      buttonScale.set(
        withSequence(
          withTiming(0.86, { duration: 100, easing: easeOut }),
          withTiming(1, { duration: 220, easing: easeOut }),
        ),
      );
    }
    setIsStamped(!isStamped);
  }

  return (
    <ArtPanel className="items-center justify-center gap-[18px]">
      <View className="bg-canvas border-continuous w-[230px] gap-3 rounded-3xl p-4">
        <View className="flex-row items-start justify-between">
          <View className="bg-accent-soft border-continuous size-12 items-center justify-center rounded-[14px]">
            <Text className="text-[26px]">🏃</Text>
          </View>
          <Animated.View style={buttonStyle}>
            <Pressable
              role="button"
              aria-label={
                isStamped
                  ? t("onboarding.stampedToday")
                  : t("onboarding.tryStamping")
              }
              onPress={toggleStamp}
              className={
                isStamped
                  ? "bg-accent size-11 items-center justify-center rounded-full"
                  : "border-accent size-11 items-center justify-center rounded-full border-2 active:opacity-70"
              }
            >
              {isStamped ? (
                <Check
                  colorClassName="accent-white"
                  size={22}
                  strokeWidth={3}
                />
              ) : (
                <Plus
                  colorClassName="accent-accent"
                  size={22}
                  strokeWidth={2.5}
                />
              )}
            </Pressable>
          </Animated.View>
        </View>
        <View>
          <Text className="text-foreground text-[17px] font-semibold">
            {name}
          </Text>
          <Text className="text-foreground-muted text-sm">
            {isStamped ? "6 stamps" : "5 stamps"}
          </Text>
        </View>
        <View className="gap-1.5">
          <View className="flex-row">
            {weekLabels.map((label, index) => (
              <Text
                key={label}
                className={
                  index === weekLabels.length - 1
                    ? "text-foreground flex-1 text-center text-[11px] font-bold"
                    : "text-foreground-muted flex-1 text-center text-[11px]"
                }
              >
                {label}
              </Text>
            ))}
          </View>
          <View className="flex-row">
            {days.map((isDayStamped, index) => (
              <View key={weekLabels[index]} className="flex-1 items-center">
                {isDayStamped ? (
                  <Animated.View
                    entering={index === days.length - 1 ? dotPop : undefined}
                    className="bg-accent size-2 rounded-full"
                  />
                ) : (
                  <View className="bg-foreground-muted size-2 rounded-full opacity-40" />
                )}
              </View>
            ))}
          </View>
        </View>
      </View>
      {isStamped ? (
        <Animated.View
          entering={FadeInDown.duration(240)
            .easing(easeOut)
            .withInitialValues({ opacity: 0, transform: [{ translateY: 10 }] })}
          className="bg-inverse h-10 flex-row items-center gap-3 rounded-full px-4"
        >
          <Text className="text-inverse-foreground text-sm">
            {t("onboarding.stampedToast", { name })}
          </Text>
          <Text className="text-inverse-accent text-sm font-bold">
            {t("onboarding.addMemo")}
          </Text>
        </Animated.View>
      ) : (
        <View className="h-10 justify-center">
          <Text className="text-foreground-muted text-[13px]">
            {t("onboarding.tryIt")}
          </Text>
        </View>
      )}
    </ArtPanel>
  );
}
