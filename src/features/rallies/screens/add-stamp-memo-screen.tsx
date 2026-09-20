import { useState } from "react";

import { Pressable, Text, TextInput, View } from "react-native";

import { useRouter } from "expo-router";

import { useUpdateStampMemo } from "../hooks/use-stamps";
import { updateStampMemoInputSchema } from "../schemas/stamps";

type AddStampMemoScreenProps = {
  stampId: number;
};

export function AddStampMemoScreen({ stampId }: AddStampMemoScreenProps) {
  const [memo, setMemo] = useState("");
  const router = useRouter();
  const update = useUpdateStampMemo();

  const isMemoValid = updateStampMemoInputSchema.safeParse({
    id: stampId,
    memo,
  }).success;
  const canSave = isMemoValid && !update.isPending;

  return (
    <View className="flex-1 gap-4 p-4">
      <Text role="heading" className="text-xl font-semibold">
        メモを追加
      </Text>

      <TextInput
        value={memo}
        onChangeText={setMemo}
        placeholder="メモを入力"
        autoFocus
        className="border-continuous rounded-[10px] border border-[#c6c6c8] p-3 text-base"
      />
      <Pressable
        role="button"
        disabled={!canSave}
        onPress={() =>
          update.mutate(
            { id: stampId, memo },
            { onSuccess: () => router.back() },
          )
        }
        className="border-continuous items-center rounded-[10px] bg-[#007aff] py-3.5 disabled:opacity-50"
      >
        <Text className="text-base font-semibold text-white">保存</Text>
      </Pressable>
    </View>
  );
}
