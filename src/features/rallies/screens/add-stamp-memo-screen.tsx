import { useState } from "react";

import { Text, TextInput, View } from "react-native";

import { useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";

import { Button } from "@/shared/components/button";

import { useUpdateStampMemo } from "../hooks/use-stamps";
import { updateStampMemoInputSchema } from "../schemas/stamps";

type AddStampMemoScreenProps = {
  stampId: number;
};

// Do not use ScrollView / KeyboardAvoidingView inside formSheet
// (see create-rally-screen.tsx for why).
// Cap memo input height and rely on the field's internal scrolling.
export function AddStampMemoScreen({ stampId }: AddStampMemoScreenProps) {
  const [memo, setMemo] = useState("");
  const { back } = useRouter();
  const headerHeight = useHeaderHeight();
  const { mutate: updateStampMemo, isPending: isSaving } = useUpdateStampMemo();

  const isMemoValid = updateStampMemoInputSchema.safeParse({
    id: stampId,
    memo,
  }).success;
  const canSave = isMemoValid && !isSaving;

  const handleSave = () => {
    if (!canSave) return;

    updateStampMemo({ id: stampId, memo }, { onSuccess: back });
  };

  return (
    <View
      testID="add-stamp-memo-form"
      className="bg-background px-5 pb-6"
      style={{ paddingTop: headerHeight + 16 }}
    >
      <View className="gap-2">
        <Text className="text-foreground text-sm font-semibold">Memo</Text>
        <TextInput
          value={memo}
          onChangeText={setMemo}
          onSubmitEditing={handleSave}
          placeholder="Enter memo"
          aria-label="Memo"
          autoFocus
          multiline
          returnKeyType="done"
          submitBehavior="blurAndSubmit"
          textAlignVertical="top"
          className="border-continuous border-border bg-surface-muted text-foreground focus:border-accent max-h-48 min-h-32 rounded-2xl border px-4 py-3.5 text-base"
          cursorColorClassName="accent-accent"
          selectionColorClassName="accent-accent"
          placeholderTextColorClassName="accent-text-muted"
        />
      </View>

      <Button
        label="Save"
        loadingLabel="Saving…"
        onPress={handleSave}
        disabled={!canSave}
        isLoading={isSaving}
        className="mt-8"
      />
    </View>
  );
}
