import { type ReactNode } from "react";

import { View } from "react-native";

import { GestureDetector } from "react-native-gesture-handler";

import { swipeBetween } from "@/shared/utils/swipe-between";

type SwipeBetweenAreaProps<T> = Parameters<typeof swipeBetween<T>>[0] & {
  children: ReactNode;
};

// Lets the swipe start only on what it wraps, so a list can take it on its
// items without the header above them (S-037: only under the switch).
export function SwipeBetweenArea<T>({
  children,
  ...options
}: SwipeBetweenAreaProps<T>) {
  return (
    <GestureDetector gesture={swipeBetween(options)}>
      <View>{children}</View>
    </GestureDetector>
  );
}
