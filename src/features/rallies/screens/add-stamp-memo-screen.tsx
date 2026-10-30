import { useState } from "react";

import { Text, View } from "react-native";

import { useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/button";
import {
  FormField,
  FormSheetLayout,
  FormTextInput,
} from "@/shared/components/form-sheet";
import { useRally } from "@/shared/hooks/use-rallies";
import { useStamp, useUpdateStampMemo } from "@/shared/hooks/use-stamps";
import { updateStampMemoInputSchema } from "@/shared/schemas/stamps";

import { StampPhotoField } from "../components/stamp-photo-field";
import { useCloseWhenMissing } from "../hooks/use-close-when-missing";

type AddStampMemoScreenProps = {
  stampId: number;
};

// Cap memo input height and rely on the field's internal scrolling
// (no ScrollView in a formSheet; see FormSheetLayout).
export function AddStampMemoScreen({ stampId }: AddStampMemoScreenProps) {
  const [memo, setMemo] = useState("");
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const { back } = useRouter();
  const { t } = useTranslation();
  const { data: stamp } = useStamp(stampId);
  const { data: rally } = useRally(stamp?.rallyId);
  const { mutate: updateStampMemo, isPending: isSaving } = useUpdateStampMemo();

  // A stamp that does not exist closes the sheet, like an invalid id.
  useCloseWhenMissing(stamp === null);

  // A memo or at least one photo (S-035).
  const isInputValid = updateStampMemoInputSchema.safeParse({
    id: stampId,
    memo,
    photoUris,
  }).success;
  const canSave = isInputValid && !isSaving;

  const handleSave = () => {
    if (!canSave) return;

    updateStampMemo(
      { id: stampId, memo, photoUris },
      { onSuccess: () => back() },
    );
  };

  return (
    <FormSheetLayout
      testID="add-stamp-memo-form"
      eyebrow={rally ? `${rally.emoji} ${rally.name}` : undefined}
      title={t("stampForm.memoAndPhotos")}
    >
      <FormField label={t("stampForm.memo")}>
        <FormTextInput
          value={memo}
          onChangeText={setMemo}
          onSubmitEditing={handleSave}
          placeholder={t("stampForm.memoPlaceholder")}
          aria-label={t("stampForm.memo")}
          autoFocus
          multiline
          returnKeyType="done"
          submitBehavior="blurAndSubmit"
          textAlignVertical="top"
          className="max-h-48 min-h-32"
        />
      </FormField>

      <View className="gap-2">
        <StampPhotoField
          photoUris={photoUris}
          onChangePhotoUris={setPhotoUris}
        />
        <Text className="text-foreground-muted text-xs">
          {t("stampForm.memoOrPhotos")}
        </Text>
      </View>

      <Button
        label={t("common.save")}
        loadingLabel={t("common.saving")}
        onPress={handleSave}
        disabled={!canSave}
        isLoading={isSaving}
        className="mt-8"
      />
    </FormSheetLayout>
  );
}
