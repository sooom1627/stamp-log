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
                ? "border-continuous bg-primary active:bg-main-hover flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-3"
                : "border-continuous bg-surface-muted active:bg-surface-muted-active flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-3"
            }
          >
            {isSelected ? (
              <View className="bg-accent size-1.5 rounded-full" />
            ) : null}
            <Text
              className={
                isSelected
                  ? "text-primary-foreground font-medium"
                  : "text-foreground font-medium"
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
