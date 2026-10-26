import { type ReactNode } from "react";

import { View } from "react-native";

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
