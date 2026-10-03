import { useEffect } from "react";

import { Alert, FlatList, Pressable, Text, View } from "react-native";

import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Button, Host, Menu } from "@expo/ui/swift-ui";
import { labelStyle, tint } from "@expo/ui/swift-ui/modifiers";

import { formatStampDateTime } from "@/shared/utils/format-stamp-date-time";

import { useDeleteRally, useRallies } from "../hooks/use-rallies";
import { useRallyStamps } from "../hooks/use-stamps";
import { type Stamp } from "../schemas/stamps";

type StampPostProps = {
  id: Stamp["id"];
  emoji: string;
  stampedAt: Stamp["stampedAt"];
  memo: Stamp["memo"];
  onEdit: (id: Stamp["id"]) => void;
};

function StampPost({ id, emoji, stampedAt, memo, onEdit }: StampPostProps) {
  return (
    <View className="flex-row gap-3">
      <Text aria-hidden className="text-2xl">
        {emoji}
      </Text>
      <View className="flex-1 gap-1">
        <Text
          selectable
          className="text-main-hover text-sm dark:text-slate-300"
        >
          {formatStampDateTime(new Date(stampedAt))}
        </Text>
        {memo ? (
          <Text selectable className="text-main text-base dark:text-slate-100">
            {memo}
          </Text>
        ) : null}
      </View>
      <Host matchContents>
        <Menu
          testID={`stamp-menu-${id}`}
          label="More"
          systemImage="ellipsis"
          modifiers={[labelStyle("iconOnly"), tint("#f97316")]}
        >
          <Button
            testID={`stamp-edit-${id}`}
            label="Edit"
            systemImage="pencil"
            onPress={() => onEdit(id)}
          />
        </Menu>
      </Host>
    </View>
  );
}

export function RallyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { back, push } = useRouter();
  const rallyId = Number(id);
  const rallies = useRallies();
  const stamps = useRallyStamps(rallyId);
  const remove = useDeleteRally();
  const rally = rallies.data?.find((candidate) => candidate.id === rallyId);

  useEffect(() => {
    if (rallies.isSuccess && !rally) {
      back();
    }
  }, [back, rallies.isSuccess, rally]);

  if (!rally) {
    return null;
  }

  const stampCount = stamps.data?.length ?? 0;

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
      <FlatList
        accessibilityLabel="Rally detail"
        className="bg-surface dark:bg-main-dark flex-1"
        contentContainerClassName="gap-6 px-5 py-6"
        contentInsetAdjustmentBehavior="automatic"
        data={stamps.data}
        keyExtractor={(stamp) => String(stamp.id)}
        renderItem={({ item }) => (
          <StampPost
            id={item.id}
            emoji={rally.emoji}
            stampedAt={item.stampedAt}
            memo={item.memo}
            onEdit={(stampId) => push(`/edit-stamp?stampId=${stampId}`)}
          />
        )}
        ListHeaderComponent={
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
        }
        ListFooterComponent={
          <View className="gap-6">
            <Pressable
              role="button"
              className="border-continuous bg-main active:bg-main-hover items-center rounded-xl px-4 py-3 dark:bg-slate-100"
              onPress={() => push(`/add-past-stamp?rallyId=${rally.id}`)}
            >
              <Text className="dark:text-main-dark font-semibold text-white">
                Past stamp
              </Text>
            </Pressable>
            <Pressable
              role="button"
              aria-label={`Delete ${rally.name}`}
              className="border-danger active:bg-danger/10 items-center rounded-xl border px-4 py-3"
              onPress={confirmDelete}
            >
              <Text className="text-danger font-semibold">Delete rally</Text>
            </Pressable>
          </View>
        }
      />
      <Stack.Screen options={{ title: rally.name }} />
    </>
  );
}
