import { Text, View } from "react-native";

import { type Rally } from "../schemas/rallies";

type RallyHeadingProps = Pick<Rally, "emoji" | "name">;

export function RallyHeading({ emoji, name }: RallyHeadingProps) {
  return (
    <View className="flex-row items-center gap-2">
      <Text className="text-xl">{emoji}</Text>
      <Text
        selectable
        numberOfLines={1}
        className="text-foreground min-w-0 flex-1 text-base font-semibold"
      >
        {name}
      </Text>
    </View>
  );
}
