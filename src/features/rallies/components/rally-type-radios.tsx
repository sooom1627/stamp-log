import { Pressable, Text, View } from "react-native";

import { rallyTypeLabels } from "../constants/rallies-constants";
import { rallyTypeSchema, type RallyType } from "../schemas/rallies";

type RallyTypeRadiosProps = {
  value: RallyType;
  onChange: (type: RallyType) => void;
};

export function RallyTypeRadios({ value, onChange }: RallyTypeRadiosProps) {
  return (
    <View role="radiogroup" style={{ flexDirection: "row", gap: 8 }}>
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
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              borderRadius: 10,
              borderCurve: "continuous",
              backgroundColor: isSelected ? "#007aff" : "#f2f2f7",
            }}
          >
            <Text style={{ color: isSelected ? "#ffffff" : "#000000" }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
