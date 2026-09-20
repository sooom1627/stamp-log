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
                ? "border-continuous flex-1 items-center rounded-[10px] bg-[#007aff] py-3"
                : "border-continuous flex-1 items-center rounded-[10px] bg-[#f2f2f7] py-3"
            }
          >
            <Text className={isSelected ? "text-white" : "text-black"}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
