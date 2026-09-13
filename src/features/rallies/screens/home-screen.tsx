import { View } from "react-native";

import { Link } from "expo-router";

export function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Link href="/create-rally">ラリーを作る</Link>
    </View>
  );
}
