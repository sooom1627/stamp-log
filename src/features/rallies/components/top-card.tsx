import { type ReactNode } from "react";

import { Text, View } from "react-native";

type Tone = "today" | "plain";

type TopCardProps = {
  label: string;
  detail?: string;
  tone: Tone;
  spokenLabel: string;
  width: number;
  testID: string;
  children: ReactNode;
};

// The frame shared by home's top cards (S-050): a white card with a head of
// a small dot, a short label and a detail on the right. Today's cards use
// the accent for the dot; With Ato does not.
export function TopCard({
  label,
  detail,
  tone,
  spokenLabel,
  width,
  testID,
  children,
}: TopCardProps) {
  return (
    <View
      accessible
      aria-label={spokenLabel}
      className="bg-surface border-continuous h-42 gap-2 rounded-[32px] px-4.5 py-4"
      style={{ width }}
      testID={testID}
    >
      <View className="mt-0.5 flex-row items-center gap-2">
        <View
          className={
            tone === "today"
              ? "bg-accent size-1.75 rounded-full"
              : "bg-foreground size-1.75 rounded-full"
          }
        />
        <Text className="text-foreground-muted text-sm font-medium">
          {label}
        </Text>
        {detail ? (
          <Text className="text-foreground-muted ml-auto text-sm">
            {detail}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

// The 96px disc on the right of a top card: a flat, nearly white cream.
export function CardDisc({ children }: { children: ReactNode }) {
  return (
    <View className="bg-card-disc size-24 items-center justify-center rounded-full">
      {children}
    </View>
  );
}
