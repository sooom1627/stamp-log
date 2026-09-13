import { Text, View } from "react-native";

import { Link } from "expo-router";

import { useQuery } from "@tanstack/react-query";

import { type RallyType } from "../rallies";
import { listRallies } from "../rallies-db";

const RALLY_TYPE_LABELS: Record<RallyType, string> = {
  place: "場所",
  action: "行動",
  person: "人",
};

export function HomeScreen() {
  const { data: rallies } = useQuery({
    queryKey: ["rallies"],
    queryFn: listRallies,
    staleTime: Infinity,
  });

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
          <Text>{RALLY_TYPE_LABELS[rally.type]}</Text>
        </View>
      ))}
    </View>
  );
}
