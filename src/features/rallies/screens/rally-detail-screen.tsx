import { useEffect } from "react";

import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { useDeleteRally, useRallies } from "../hooks/use-rallies";
import { useStamps } from "../hooks/use-stamps";

export function RallyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { back } = useRouter();
  const rallies = useRallies();
  const stamps = useStamps();
  const remove = useDeleteRally();
  const rallyId = Number(id);
  const rally = rallies.data?.find((candidate) => candidate.id === rallyId);

  useEffect(() => {
    if (rallies.isSuccess && !rally) {
      back();
    }
  }, [back, rallies.isSuccess, rally]);

  if (!rally) {
    return null;
  }

  const stampCount =
    stamps.data?.filter((stamp) => stamp.rallyId === rally.id).length ?? 0;

  const confirmDelete = () =>
    Alert.alert("Delete rally?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => remove.mutate(rally.id, { onSuccess: back }),
      },
    ]);

  return (
    <>
      <ScrollView
        accessibilityLabel="Rally detail"
        className="bg-surface dark:bg-main-dark flex-1"
        contentContainerClassName="gap-6 px-5 py-6"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="items-center gap-3">
          <Text className="text-5xl">{rally.emoji}</Text>
          <Text
            selectable
            role="heading"
            className="text-main text-2xl font-semibold dark:text-slate-100"
          >
            {rally.name}
          </Text>
          <Text className="text-main-hover text-base dark:text-slate-300">
            {stampCount} {stampCount === 1 ? "stamp" : "stamps"}
          </Text>
        </View>
        <Pressable
          role="button"
          aria-label={`Delete ${rally.name}`}
          className="border-danger active:bg-danger/10 items-center rounded-xl border px-4 py-3"
          onPress={confirmDelete}
        >
          <Text className="text-danger font-semibold">Delete rally</Text>
        </Pressable>
      </ScrollView>
      <Stack.Screen options={{ title: rally.name }} />
    </>
  );
}
