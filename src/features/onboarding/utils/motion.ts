import { Easing } from "react-native-reanimated";

// Curves for the onboarding's motion (S-054). Reanimated's timing and
// layout animations skip to their last frame when Reduce Motion is on.
export const easeOut = Easing.bezier(0.23, 1, 0.32, 1);
