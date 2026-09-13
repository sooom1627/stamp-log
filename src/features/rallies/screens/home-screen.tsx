import { Text, View } from "react-native";

import { Link } from "expo-router";

import { rallyTypeLabels } from "../constants/rallies-constants";
import { useRallies } from "../hooks/use-rallies";

export function HomeScreen() {
  const { data: rallies } = useRallies();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <Link href="/create-rally">ラリーを作る</Link>
      {rallies?.map((rally) => (
        <View key={rally.id} style={{ alignItems: "center", gap: 4 }}>
          <Text selectable>{rally.name}</Text>
          <Text>{rallyTypeLabels[rally.type]}</Text>
        </View>
      ))}
    </View>
  );
}
