import { Pressable, Text, View } from "react-native";

import {
  rallyTypeLabels,
  rallyTypeSchema,
  type RallyType,
} from "../schemas/rallies";

type RallyTypeRadiosProps = {
  value: RallyType;
  onChange: (type: RallyType) => void;
};

export function RallyTypeRadios({ value, onChange }: RallyTypeRadiosProps) {
  return (
    <View role="radiogroup" className="flex-row gap-2">
      {rallyTypeSchema.options.map((type) => {
        const isSelected = value === type;
        const label = rallyTypeLabels[type];
        return (
          <Pressable
            key={type}
            role="radio"
            aria-checked={isSelected}
            accessibilityLabel={label}
            onPress={() => onChange(type)}
            className={
              isSelected
                ? "border-continuous bg-main active:bg-main-hover flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-3 dark:bg-slate-100"
                : "border-continuous bg-surface-muted active:bg-surface-muted-active dark:bg-main-hover flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-3"
            }
          >
            {isSelected ? (
              <View className="bg-accent size-1.5 rounded-full" />
            ) : null}
            <Text
              className={
                isSelected
                  ? "dark:text-main-dark font-medium text-white"
                  : "text-main font-medium dark:text-slate-100"
              }
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
