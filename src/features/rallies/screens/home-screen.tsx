import { Alert, Pressable, Text, View } from "react-native";

import { Link } from "expo-router";

import {
  cancelLabel,
  deleteRallyConfirmMessage,
  deleteRallyConfirmTitle,
  deleteRallyLabel,
  rallyTypeLabels,
} from "../constants/rallies-constants";
import { useDeleteRally, useRallies } from "../hooks/use-rallies";
import { type Rally } from "../schemas/rallies";

export function HomeScreen() {
  const { data: rallies } = useRallies();
  const remove = useDeleteRally();

  const confirmDelete = (rally: Rally) =>
    Alert.alert(deleteRallyConfirmTitle, deleteRallyConfirmMessage, [
      { text: cancelLabel, style: "cancel" },
      {
        text: deleteRallyLabel,
        style: "destructive",
        onPress: () => remove.mutate(rally.id),
      },
    ]);

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
            onPress={() => confirmDelete(rally)}
          >
            <Text className="text-red-500">{deleteRallyLabel}</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}
