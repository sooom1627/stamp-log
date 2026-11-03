import { type ReactNode } from "react";

import { View } from "react-native";

// Every picture waits for the page to slide in before it moves.
export const pageInDelay = 300;

// The rounded panel every picture sits on.
export function ArtPanel({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <View
      className={`bg-surface border-continuous flex-1 overflow-hidden rounded-[32px] ${className}`}
    >
      {children}
    </View>
  );
}
