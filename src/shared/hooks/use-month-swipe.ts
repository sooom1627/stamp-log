import { useEffect, useRef } from "react";

import { type LayoutChangeEvent } from "react-native";

import { usePanGesture } from "react-native-gesture-handler";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

// A swipe starts once the finger moves this far sideways, and gives way to
// the screen's vertical scroll when it moves this far up or down first.
const SWIPE_START_X = 20;
const SWIPE_FAIL_Y = 15;
// Letting go turns the month after this much travel, or after a flick this
// fast (points per second) even when the finger moved little.
const SWIPE_TURN_X = 40;
const SWIPE_TURN_VELOCITY = 500;
const SLIDE_OUT_MS = 160;
const SLIDE_IN_MS = 220;
const SNAP_BACK_MS = 180;
const easeOut = Easing.out(Easing.cubic);

type MonthSwipeOptions = {
  // Names the gesture (`${testID}-swipe`) for tests.
  testID: string;
  // The shown month; when it changes the new days slide in from its side.
  month: Date;
  // Called with +1 (next month, swiped left) or -1 (previous, swiped right).
  onStep: (delta: number) => void;
};

// The calendar's days follow the finger sideways (S-051 T-002). Letting go far
// or fast enough slides them out and asks for the next month; otherwise they
// slide back. However the month changes, the new days slide in from the side
// they come from: the next month from the right, the previous from the left.
export function useMonthSwipe({ testID, month, onStep }: MonthSwipeOptions) {
  const width = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const monthIndex = month.getFullYear() * 12 + month.getMonth();
  const shownMonthIndex = useRef(monthIndex);

  useEffect(() => {
    const side = Math.sign(monthIndex - shownMonthIndex.current);
    shownMonthIndex.current = monthIndex;
    if (side === 0) return;
    offsetX.set(side * width.get());
    offsetX.set(withTiming(0, { duration: SLIDE_IN_MS, easing: easeOut }));
  }, [monthIndex, offsetX, width]);

  const gesture = usePanGesture({
    testID: `${testID}-swipe`,
    activeOffsetX: [-SWIPE_START_X, SWIPE_START_X],
    failOffsetY: [-SWIPE_FAIL_Y, SWIPE_FAIL_Y],
    onUpdate: ({ translationX }) => {
      "worklet";
      offsetX.set(translationX);
    },
    onDeactivate: ({ canceled, translationX, velocityX }) => {
      "worklet";
      const isFlick = Math.abs(velocityX) >= SWIPE_TURN_VELOCITY;
      const isTurn = isFlick || Math.abs(translationX) >= SWIPE_TURN_X;
      if (canceled || !isTurn) {
        offsetX.set(withTiming(0, { duration: SNAP_BACK_MS, easing: easeOut }));
        return;
      }
      const delta = (isFlick ? velocityX : translationX) < 0 ? 1 : -1;
      offsetX.set(
        withTiming(
          -delta * width.get(),
          { duration: SLIDE_OUT_MS, easing: easeOut },
          (isFinished) => {
            if (isFinished) scheduleOnRN(onStep, delta);
          },
        ),
      );
    },
  });

  const daysStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.get() }],
  }));
  const onDaysLayout = ({ nativeEvent }: LayoutChangeEvent) =>
    width.set(nativeEvent.layout.width);

  return { gesture, daysStyle, onDaysLayout };
}
