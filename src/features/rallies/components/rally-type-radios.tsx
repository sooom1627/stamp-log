import { Pressable, Text, View } from "react-native";

import {
  rallyTypeLabels,
  rallyTypeSchema,
  type RallyType,
} from "../schemas/rallies";

const radioClassNames = {
  selected: "bg-primary active:bg-main-hover",
  unselected: "bg-surface-muted active:bg-surface-muted-active",
} as const;

const labelClassNames = {
  selected: "text-primary-foreground",
  unselected: "text-foreground",
} as const;

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
        const state = isSelected ? "selected" : "unselected";
        return (
          <Pressable
            key={type}
            role="radio"
            aria-checked={isSelected}
            aria-label={label}
            onPress={() => onChange(type)}
            className={`border-continuous flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-3 ${radioClassNames[state]}`}
          >
            {isSelected ? (
              <View className="bg-accent size-1.5 rounded-full" />
            ) : null}
            <Text className={`font-medium ${labelClassNames[state]}`}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
