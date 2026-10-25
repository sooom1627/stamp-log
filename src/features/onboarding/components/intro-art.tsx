import { useState } from "react";

import { Pressable, Text, View } from "react-native";

import { Check, Plus } from "@/shared/components/icons";

// Pictures for the four intro pages (S-047). Drawn with views so they follow
// the theme; they only show, never save.

// A month of dots with a few stamps: what is left when you look back.
const stampedDays = new Map([
  [7, "🏃"],
  [16, "☕"],
  [20, "📚"],
  [25, "🤝"],
  [31, "⛰️"],
]);

function StampedMonthArt() {
  return (
    <View className="w-64 flex-row flex-wrap gap-y-3">
      {Array.from({ length: 35 }, (_, day) => (
        <View key={day} className="w-[14.28%] items-center">
          {stampedDays.has(day) ? (
            <View className="bg-accent-soft size-8 items-center justify-center rounded-full">
              <Text className="text-base">{stampedDays.get(day)}</Text>
            </View>
          ) : (
            <View className="size-8 items-center justify-center">
              <View className="bg-surface-muted-active size-1.5 rounded-full" />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const exampleRallies = [
  ["🔬", "Researchers I met"],
  ["☕", "Cafés"],
  ["⛰️", "Hikes"],
  ["📚", "Books I read"],
  ["🍜", "Ramen"],
  ["🤝", "Old friends"],
  ["🎬", "Movies"],
  ["✈️", "Trips"],
];

function ExampleRalliesArt() {
  return (
    <View className="w-72 flex-row flex-wrap justify-center gap-2">
      {exampleRallies.map(([emoji, name]) => (
        <View
          key={name}
          className="bg-surface border-continuous flex-row items-center gap-1.5 rounded-full px-3.5 py-2"
        >
          <Text className="text-base">{emoji}</Text>
          <Text className="text-foreground text-sm font-medium">{name}</Text>
        </View>
      ))}
    </View>
  );
}

// A tile to try the stamp button on.
function TryStampArt() {
  const [isStamped, setIsStamped] = useState(false);

  return (
    <View className="items-center gap-4">
      <View className="bg-surface border-continuous w-44 gap-3 rounded-3xl p-3.5">
        <View className="flex-row items-start justify-between">
          <View className="bg-accent-soft border-continuous size-11 items-center justify-center rounded-2xl">
            <Text className="text-2xl">🏃</Text>
          </View>
          <Pressable
            role="button"
            aria-label={isStamped ? "Stamped today" : "Try stamping"}
            // Same look as the Home tile's stamp button; 44px hit area.
            hitSlop={6}
            onPress={() => setIsStamped(!isStamped)}
            className={
              isStamped
                ? "bg-accent size-8 items-center justify-center rounded-full"
                : "border-accent size-8 items-center justify-center rounded-full border-[1.5px] active:opacity-70"
            }
          >
            {isStamped ? (
              <Check colorClassName="accent-white" size={16} strokeWidth={3} />
            ) : (
              <Plus
                colorClassName="accent-accent"
                size={16}
                strokeWidth={2.5}
              />
            )}
          </Pressable>
        </View>
        <View>
          <Text className="text-foreground text-base font-semibold">
            Morning run
          </Text>
          <Text className="text-foreground-muted text-sm">
            {isStamped ? "6 stamps" : "5 stamps"}
          </Text>
        </View>
      </View>
      <Text className="text-foreground-muted text-sm">
        {isStamped ? "Stamped." : "Try it: tap ＋"}
      </Text>
    </View>
  );
}

// A week with gaps: the days without a stamp are only space.
const weekDays = [
  ["Mo", true],
  ["Tu", false],
  ["We", false],
  ["Th", true],
  ["Fr", false],
  ["Sa", false],
  ["Su", true],
] as const;

function QuietWeekArt() {
  return (
    <View className="bg-surface border-continuous w-64 flex-row rounded-3xl px-3 py-4">
      {weekDays.map(([label, isStamped]) => (
        <View key={label} className="flex-1 items-center gap-2">
          <Text className="text-foreground-muted text-xs font-medium">
            {label}
          </Text>
          <View
            className={
              isStamped
                ? "bg-accent size-2.5 rounded-full"
                : "bg-surface-muted-active size-2.5 rounded-full"
            }
          />
        </View>
      ))}
    </View>
  );
}

export const introArt = [
  StampedMonthArt,
  ExampleRalliesArt,
  TryStampArt,
  QuietWeekArt,
] as const;
