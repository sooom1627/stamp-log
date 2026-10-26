import {
  ActivityIndicator,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import Animated from "react-native-reanimated";

import { Check, Plus } from "@/shared/components/icons";
import { formatHeaderDate } from "@/shared/utils/format-header-date";

// The first rally to start with (S-047). Renamed later like any rally.
export const firstRallyTemplates = [
  { emoji: "🏃", name: "Morning run" },
  { emoji: "☕", name: "Cafés I visited" },
  { emoji: "🤝", name: "People I met" },
  { emoji: "📚", name: "Books I read" },
] as const;

type Template = (typeof firstRallyTemplates)[number];

const cardWidth = 250;
const cardGap = 16;
const previewDots = [false, true, false, false, true, false, true];

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
  const { width } = useWindowDimensions();
  const selected = firstRallyTemplates[selectedIndex];
  // Centers the chosen card; the others peek in from the sides.
  const trackX =
    (width - cardWidth) / 2 - selectedIndex * (cardWidth + cardGap);

  return (
    <View className="flex-1">
      <View className="items-center gap-2.5 px-6">
        <Text className="text-accent-strong text-[13px] font-semibold">
          Last step
        </Text>
        <Text
          role="heading"
          className="text-foreground text-center text-[32px] leading-9 font-bold"
        >
          What will you collect first?
        </Text>
        <Text className="text-foreground-muted text-center text-base leading-[23px]">
          Start with one. You can rename it or make your own anytime.
        </Text>
      </View>
      <View className="mt-6 max-h-98 flex-1 overflow-hidden pt-1.5">
        <Animated.View
          className="flex-1 flex-row"
          style={{
            gap: cardGap,
            transform: [{ translateX: trackX }],
            transitionProperty: "transform",
            transitionDuration: 350,
          }}
        >
          {firstRallyTemplates.map((template, index) => (
            <TemplateCard
              key={template.name}
              template={template}
              isSelected={index === selectedIndex}
              onPress={() => onSelect(index)}
            />
          ))}
        </Animated.View>
      </View>
      <View className="mt-3.5 flex-row justify-center gap-2.5">
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
                  ? "bg-accent-soft border-accent size-11 items-center justify-center rounded-full border-2"
                  : "bg-surface size-11 items-center justify-center rounded-full border-2 border-transparent active:opacity-70"
              }
            >
              <Text className="text-xl">{template.emoji}</Text>
            </Pressable>
          );
        })}
      </View>
      <View className="mt-auto gap-1 px-6 pt-4">
        <Pressable
          role="button"
          aria-label={`Start with ${selected.name}`}
          aria-busy={isStarting}
          disabled={isStarting}
          onPress={onStart}
          className="bg-primary active:bg-main-hover h-[54px] flex-row items-center justify-center gap-2 rounded-full"
        >
          {isStarting ? (
            <ActivityIndicator
              size="small"
              colorClassName="accent-primary-foreground"
            />
          ) : null}
          <Text className="text-primary-foreground text-base font-semibold">
            Start with {selected.name}
          </Text>
        </Pressable>
        <Pressable
          role="button"
          onPress={onMakeOwn}
          disabled={isStarting}
          className="h-11 items-center justify-center active:opacity-70"
        >
          <Text className="text-foreground-muted text-[15px] font-semibold">
            I&apos;ll make my own
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

type TemplateCardProps = {
  template: Template;
  isSelected: boolean;
  onPress: () => void;
};

// A preview of Home on the first day with this rally.
function TemplateCard({ template, isSelected, onPress }: TemplateCardProps) {
  const { monthDay, weekday } = formatHeaderDate(new Date());

  return (
    <Pressable
      role="button"
      aria-label={`Preview of ${template.name}`}
      onPress={onPress}
      className={`bg-surface border-continuous gap-3 rounded-[30px] p-3.5 ${
        isSelected ? "shadow-fab" : ""
      }`}
      style={{
        width: cardWidth,
        opacity: isSelected ? 1 : 0.55,
        transform: [{ scale: isSelected ? 1 : 0.92 }],
      }}
    >
      <View className="px-1 pt-1">
        <Text className="text-foreground text-lg font-bold">{monthDay}</Text>
        <Text className="text-foreground-muted text-xs">{weekday}</Text>
      </View>
      <View className="bg-accent-subtle border-continuous flex-row items-center gap-2.5 rounded-[18px] p-2.5">
        <View
          className="border-accent size-[52px] items-center justify-center rounded-full border-2"
          style={{ transform: [{ rotate: "-8deg" }] }}
        >
          <Text className="text-2xl">{template.emoji}</Text>
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-foreground text-[13px] font-bold">
            1 stamp today
          </Text>
          <Text className="text-foreground-secondary text-xs">
            {template.name}
          </Text>
        </View>
      </View>
      <View className="flex-row gap-2">
        <View className="bg-canvas border-continuous flex-1 gap-2 rounded-2xl p-2.5">
          <View className="flex-row justify-between">
            <View className="bg-accent-soft border-continuous size-[30px] items-center justify-center rounded-[9px]">
              <Text className="text-base">{template.emoji}</Text>
            </View>
            <View className="bg-accent size-[22px] items-center justify-center rounded-full">
              <Check
                colorClassName="accent-white"
                size={12}
                strokeWidth={3.5}
              />
            </View>
          </View>
          <Text className="text-foreground text-xs leading-[14px] font-semibold">
            {template.name}
          </Text>
          <View className="flex-row justify-between">
            {previewDots.map((isStamped, index) => (
              <View
                key={index}
                className={
                  isStamped
                    ? "bg-accent size-[5px] rounded-full"
                    : "bg-foreground-muted size-[5px] rounded-full opacity-40"
                }
              />
            ))}
          </View>
        </View>
        <View className="border-foreground-muted/40 border-continuous flex-1 items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-dashed p-2.5">
          <Plus
            colorClassName="accent-foreground-muted"
            size={18}
            strokeWidth={2.5}
          />
          <Text className="text-foreground-muted text-xs font-semibold">
            New rally
          </Text>
        </View>
      </View>
      <View className="gap-1.5 px-1">
        <View className="bg-border h-2 w-[70%] rounded-full" />
        <View className="bg-border h-2 w-[46%] rounded-full" />
      </View>
    </Pressable>
  );
}
