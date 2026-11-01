import { useEffect } from "react";

import { useSharedValue, withDelay, withTiming } from "react-native-reanimated";

import { easeOut } from "@/shared/utils/motion";

// 0 → 1 once, the first time a page of the intro opens (S-054). Opening the
// page again keeps it at 1, so the picture stays still. With Reduce Motion
// on, it jumps to 1.
export function useEntrance(isActive: boolean, delay: number, duration = 380) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!isActive) return;
    progress.set(
      withDelay(delay, withTiming(1, { duration, easing: easeOut })),
    );
  }, [isActive, delay, duration, progress]);

  return progress;
}
