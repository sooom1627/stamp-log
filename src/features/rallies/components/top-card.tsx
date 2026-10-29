import { useId, type ReactNode } from "react";

import { Text, View } from "react-native";

import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { useCSSVariable } from "uniwind";

type Tone = "today" | "sand";

type TopCardProps = {
  label: string;
  detail?: string;
  tone: Tone;
  spokenLabel: string;
  width: number;
  testID: string;
  children: ReactNode;
};

// The frame shared by home's top cards (S-050): a white card with a soft
// glow in its top-right corner, and a head of a small dot, a short label
// and a detail on the right. Today's cards use the accent; With Ato does not.
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
      className="bg-surface border-continuous h-42 gap-2 overflow-hidden rounded-[32px] px-4.5 py-4"
      style={{ width }}
      testID={testID}
    >
      <CornerGlow tone={tone} />
      <View className="flex-row items-center gap-2">
        <View
          className={
            tone === "today"
              ? "bg-accent size-1.75 rounded-full"
              : "bg-foreground size-1.75 rounded-full"
          }
        />
        <Text className="text-foreground-secondary text-[13px]">{label}</Text>
        {detail ? (
          <Text className="text-foreground-muted ml-auto text-[13px]">
            {detail}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function CornerGlow({ tone }: { tone: Tone }) {
  const id = useId();
  const color = useCSSVariable(
    tone === "today" ? "--color-card-glow-today" : "--color-card-glow-sand",
  ) as string;

  return (
    <View className="absolute -top-22 -right-20" aria-hidden>
      <Svg width={240} height={240}>
        <Defs>
          <RadialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={0.32} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={120} cy={120} r={120} fill={`url(#${id}-glow)`} />
      </Svg>
    </View>
  );
}

// The 96px disc on the right of a top card: white fading to pale sand, lit
// from the top left.
export function CardDisc({
  children,
  testID,
}: {
  children: ReactNode;
  testID?: string;
}) {
  const id = useId();
  const from = useCSSVariable("--color-card-disc-from") as string;
  const to = useCSSVariable("--color-card-disc-to") as string;

  return (
    <View
      className="border-border size-24 items-center justify-center rounded-full border"
      testID={testID}
    >
      <View className="absolute inset-0" aria-hidden>
        <Svg width="100%" height="100%" viewBox="0 0 96 96">
          <Defs>
            <RadialGradient id={`${id}-disc`} cx="34%" cy="28%" r="78%">
              <Stop offset="0" stopColor={from} />
              <Stop offset="1" stopColor={to} />
            </RadialGradient>
          </Defs>
          <Circle cx={48} cy={48} r={48} fill={`url(#${id}-disc)`} />
        </Svg>
      </View>
      {children}
    </View>
  );
}

// The big, light number of a top card with its unit beside it.
export function CardNumber({ value, unit }: { value: string; unit: string }) {
  return (
    <Text className="text-foreground text-5xl font-extralight tracking-tight">
      {value}
      <Text className="text-foreground-muted text-[13px] font-normal tracking-normal">
        {` ${unit}`}
      </Text>
    </Text>
  );
}
