import { Gesture } from "react-native-gesture-handler";

// A swipe shorter than this stays where it is.
const SWIPE_DISTANCE = 60;

type SwipeBetweenOptions<T> = {
  testId: string;
  values: readonly T[];
  value: T;
  onChange: (value: T) => void;
  isEnabled?: boolean;
  // Points at the left edge where the swipe cannot start, leaving that edge
  // to the system back gesture on a pushed screen.
  leftEdge?: number;
};

// Switches a segmented choice by swiping sideways (S-039, S-037): left goes
// to the next value, right to the previous one, and the ends stay put. It
// starts only on a sideways move, so vertical scrolling is untouched.
export function swipeBetween<T>({
  testId,
  values,
  value,
  onChange,
  isEnabled = true,
  leftEdge = 0,
}: SwipeBetweenOptions<T>) {
  return Gesture.Pan()
    .withTestId(testId)
    .enabled(isEnabled)
    .hitSlop({ left: -leftEdge })
    .activeOffsetX([-20, 20])
    .failOffsetY([-15, 15])
    .runOnJS(true)
    .onEnd(({ translationX }) => {
      if (Math.abs(translationX) < SWIPE_DISTANCE) return;
      const index = values.indexOf(value);
      const next = values[index + (translationX < 0 ? 1 : -1)];
      if (next !== undefined) onChange(next);
    });
}
