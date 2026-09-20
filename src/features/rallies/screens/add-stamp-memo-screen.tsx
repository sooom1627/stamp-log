import { useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";

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
  const update = useUpdateStampMemo();

  const isMemoValid = updateStampMemoInputSchema.safeParse({
    id: stampId,
    memo,
  }).success;
  const canSave = isMemoValid && !update.isPending;

  const handleSave = () => {
    if (!canSave) return;

    update.mutate({ id: stampId, memo }, { onSuccess: back });
  };

  return (
    <View
      testID="add-stamp-memo-form"
      className="bg-surface dark:bg-main-dark px-5 pb-6"
      style={{ paddingTop: headerHeight + 16 }}
    >
      <View className="gap-2">
        <Text className="text-main text-sm font-semibold dark:text-slate-100">
          Memo
        </Text>
        <TextInput
          value={memo}
          onChangeText={setMemo}
          onSubmitEditing={handleSave}
          placeholder="Enter memo"
          accessibilityLabel="Memo"
          autoFocus
          multiline
          returnKeyType="done"
          submitBehavior="blurAndSubmit"
          textAlignVertical="top"
          className="border-continuous border-border bg-surface-muted text-main focus:border-accent dark:bg-main-hover max-h-48 min-h-32 rounded-2xl border px-4 py-3.5 text-base dark:border-slate-700 dark:text-slate-100"
          cursorColorClassName="accent-accent"
          selectionColorClassName="accent-accent"
          placeholderTextColorClassName="accent-text-muted"
        />
      </View>

      <Pressable
        role="button"
        accessibilityLabel={update.isPending ? "Saving…" : "Save"}
        accessibilityState={{
          disabled: !canSave,
          busy: update.isPending,
        }}
        disabled={!canSave}
        onPress={handleSave}
        className={
          canSave || update.isPending
            ? "border-continuous bg-main active:bg-main-hover mt-8 flex-row items-center justify-center gap-2 rounded-2xl py-4 dark:bg-slate-100"
            : "border-continuous bg-surface-muted-active mt-8 flex-row items-center justify-center gap-2 rounded-2xl py-4"
        }
      >
        {update.isPending ? (
          <ActivityIndicator
            size="small"
            colorClassName="accent-white dark:accent-main-dark"
          />
        ) : null}
        <Text
          className={
            canSave || update.isPending
              ? "dark:text-main-dark text-base font-semibold text-white"
              : "text-text-muted text-base font-semibold"
          }
        >
          {update.isPending ? "Saving…" : "Save"}
        </Text>
      </Pressable>
    </View>
  );
}
