import { Pressable, Text, View } from "react-native";

import { Link } from "expo-router";

import {
  deleteRallyLabel,
  rallyTypeLabels,
} from "../constants/rallies-constants";
import { useRallies } from "../hooks/use-rallies";

export function HomeScreen() {
  const { data: rallies } = useRallies();

  return (
    <View className="flex-1 items-center justify-center gap-4">
      <Link href="/create-rally">ラリーを作る</Link>
      {rallies?.map((rally) => (
        <View key={rally.id} className="items-center gap-1">
          <Text selectable>{rally.name}</Text>
          <Text>{rallyTypeLabels[rally.type]}</Text>
          <Pressable
            role="button"
            aria-label={`${rally.name}を${deleteRallyLabel}`}
          >
            <Text className="text-red-500">{deleteRallyLabel}</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}
