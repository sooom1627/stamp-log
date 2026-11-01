import {
  Easing,
  Keyframe,
  withSequence,
  withTiming,
} from "react-native-reanimated";

// The app's small answers to a press, first made for the onboarding (S-054)
// and shared with home's tiles (S-056). Reanimated's timing and layout
// animations skip to their last frame when Reduce Motion is on.
export const easeOut = Easing.bezier(0.23, 1, 0.32, 1);

// The stamp button sinks for a moment and comes back.
export function pressStampButton() {
  return withSequence(
    withTiming(0.86, { duration: 100, easing: easeOut }),
    withTiming(1, { duration: 220, easing: easeOut }),
  );
}

// Today's dot swells as it fills, then settles.
export const dotPop = new Keyframe({
  0: { transform: [{ scale: 0.4 }] },
  60: { transform: [{ scale: 1.6 }], easing: easeOut },
  100: { transform: [{ scale: 1 }], easing: easeOut },
}).duration(360);
