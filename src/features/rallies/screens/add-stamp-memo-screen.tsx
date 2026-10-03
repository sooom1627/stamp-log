import { useState } from "react";

import { useRouter } from "expo-router";

import { Button } from "@/shared/components/button";
import {
  FormField,
  FormSheetContainer,
  FormTextInput,
} from "@/shared/components/form-sheet";

import { useUpdateStampMemo } from "../hooks/use-stamps";
import { updateStampMemoInputSchema } from "../schemas/stamps";

type AddStampMemoScreenProps = {
  stampId: number;
};

// Cap memo input height and rely on the field's internal scrolling
// (no ScrollView in a formSheet; see FormSheetContainer).
export function AddStampMemoScreen({ stampId }: AddStampMemoScreenProps) {
  const [memo, setMemo] = useState("");
  const { back } = useRouter();
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
    <FormSheetContainer testID="add-stamp-memo-form">
      <FormField label="Memo">
        <FormTextInput
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
          className="max-h-48 min-h-32"
        />
      </FormField>

      <Button
        label="Save"
        loadingLabel="Saving…"
        onPress={handleSave}
        disabled={!canSave}
        isLoading={isSaving}
        className="mt-8"
      />
    </FormSheetContainer>
  );
}
