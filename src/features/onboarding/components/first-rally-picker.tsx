import { Pressable, Text, View } from "react-native";

import { Button } from "@/shared/components/button";

// The first rally to start with (S-047). Renamed later like any rally.
export const firstRallyTemplates = [
  { emoji: "🏃", name: "Morning run" },
  { emoji: "☕", name: "Cafés I visited" },
  { emoji: "🤝", name: "People I met" },
  { emoji: "📚", name: "Books I read" },
] as const;

type FirstRallyPickerProps = {
  selectedIndex: number;
  onSelect: (index: number) => void;
  onStart: () => void;
  onMakeOwn: () => void;
  isStarting: boolean;
};

export function FirstRallyPicker({
  selectedIndex,
  onSelect,
  onStart,
  onMakeOwn,
  isStarting,
}: FirstRallyPickerProps) {
  const selected = firstRallyTemplates[selectedIndex];

  return (
    <View className="flex-1 justify-between">
      <View className="gap-6">
        <View className="gap-2">
          <Text
            role="heading"
            className="text-foreground text-3xl leading-9 font-bold"
          >
            What will you collect first?
          </Text>
          <Text className="text-foreground-secondary text-base">
            Start with one. You can rename it anytime.
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-2.5">
          {firstRallyTemplates.map((template, index) => {
            const isSelected = index === selectedIndex;
            return (
              <Pressable
                key={template.name}
                role="button"
                aria-label={`${template.emoji} ${template.name}`}
                aria-selected={isSelected}
                onPress={() => onSelect(index)}
                className={
                  isSelected
                    ? "bg-surface border-accent border-continuous min-h-28 w-[48.5%] justify-between rounded-3xl border-2 p-3.5"
                    : "bg-surface border-continuous min-h-28 w-[48.5%] justify-between rounded-3xl border-2 border-transparent p-3.5 active:opacity-70"
                }
              >
                <View className="bg-accent-soft border-continuous size-11 items-center justify-center rounded-2xl">
                  <Text className="text-2xl">{template.emoji}</Text>
                </View>
                <Text className="text-foreground text-base leading-5 font-semibold">
                  {template.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View className="gap-1">
        <Button
          label={`Start with ${selected.name}`}
          onPress={onStart}
          isLoading={isStarting}
        />
        <Pressable
          role="button"
          onPress={onMakeOwn}
          disabled={isStarting}
          className="min-h-11 items-center justify-center active:opacity-70"
        >
          <Text className="text-foreground-secondary text-base font-medium">
            I&apos;ll make my own
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
