import { useEffect, useRef, useState } from "react";

import { type LayoutChangeEvent } from "react-native";

import { usePanGesture } from "react-native-gesture-handler";
import {
  cancelAnimation,
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
// Letting go turns to the page beside after a quarter of the width (at least
// this many points), or after a flick this fast (points per second).
const SWIPE_TURN_RATIO = 0.25;
const SWIPE_TURN_MIN_X = 40;
const SWIPE_TURN_VELOCITY = 500;
const SLIDE_MS = 260;
const slideEasing = Easing.out(Easing.cubic);

// Months counted from year 0, so the months before and after are -1 and +1.
export function monthNumber(month: Date) {
  return month.getFullYear() * 12 + month.getMonth();
}

type MonthSwipeOptions = {
  // Names the gesture (`${testID}-swipe`) for tests.
  testID: string;
  // The shown month (its first local day).
  month: Date;
  // Called with +1 (next month, swiped left) or -1 (previous, swiped right).
  onStep: (delta: number) => void;
};

// The calendar's months are pages on a strip (S-051 T-003). Page n sits at
// n × the width from the first month shown, and the strip moves so the page
// of `page` (a month number, fractional while moving) is in view. A swipe
// drags the strip; letting go settles on the page beside or back on the shown
// one. When the month changes by one (a swipe, ‹ ›, or Logs' previous-month
// button) the strip slides there; further (the picker) it jumps.
export function useMonthSwipe({ testID, month, onStep }: MonthSwipeOptions) {
  const shownNumber = monthNumber(month);
  // Pages are placed from the first month shown, so offsets stay small.
  const [firstMonthNumber] = useState(shownNumber);
  const width = useSharedValue(0);
  const page = useSharedValue(shownNumber);
  const settledPage = useSharedValue(shownNumber);
  const dragStartPage = useSharedValue(shownNumber);
  const lastShownNumber = useRef(shownNumber);

  useEffect(() => {
    const distance = Math.abs(shownNumber - lastShownNumber.current);
    lastShownNumber.current = shownNumber;
    settledPage.set(shownNumber);
    if (distance === 0) return;
    page.set(
      distance === 1
        ? withTiming(shownNumber, { duration: SLIDE_MS, easing: slideEasing })
        : shownNumber,
    );
  }, [shownNumber, page, settledPage]);

  const gesture = usePanGesture({
    testID: `${testID}-swipe`,
    activeOffsetX: [-SWIPE_START_X, SWIPE_START_X],
    failOffsetY: [-SWIPE_FAIL_Y, SWIPE_FAIL_Y],
    onActivate: () => {
      "worklet";
      cancelAnimation(page);
      dragStartPage.set(page.get());
    },
    onUpdate: ({ translationX }) => {
      "worklet";
      const pageWidth = width.get();
      if (pageWidth === 0) return;
      const settled = settledPage.get();
      const dragged = dragStartPage.get() - translationX / pageWidth;
      // Only the pages beside the shown one are ready.
      page.set(Math.min(settled + 1, Math.max(settled - 1, dragged)));
    },
    onDeactivate: ({ canceled, translationX, velocityX }) => {
      "worklet";
      const settled = settledPage.get();
      const turnDistance = Math.max(
        SWIPE_TURN_MIN_X,
        width.get() * SWIPE_TURN_RATIO,
      );
      const isFlick = Math.abs(velocityX) >= SWIPE_TURN_VELOCITY;
      const isTurn = isFlick || Math.abs(translationX) >= turnDistance;
      const timing = { duration: SLIDE_MS, easing: slideEasing };
      if (canceled || !isTurn) {
        page.set(withTiming(settled, timing));
        return;
      }
      const delta = (isFlick ? velocityX : translationX) < 0 ? 1 : -1;
      page.set(withTiming(settled + delta, timing));
      scheduleOnRN(onStep, delta);
    },
  });

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -(page.get() - firstMonthNumber) * width.get() }],
  }));
  const onPagesLayout = ({ nativeEvent }: LayoutChangeEvent) =>
    width.set(nativeEvent.layout.width);

  return { gesture, stripStyle, onPagesLayout, firstMonthNumber };
}
