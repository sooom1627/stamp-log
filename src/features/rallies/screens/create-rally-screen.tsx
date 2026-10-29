import { useState } from "react";

import { useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/button";
import { FormSheetLayout } from "@/shared/components/form-sheet";
import { useSaveRally } from "@/shared/hooks/use-rallies";
import {
  defaultRallyEmoji,
  rallyEmojiSchema,
  rallyNameSchema,
} from "@/shared/schemas/rallies";

import { RallyFormFields } from "../components/rally-form-fields";

export function CreateRallyScreen() {
  const [emoji, setEmoji] = useState(defaultRallyEmoji);
  const [name, setName] = useState("");
  const { back } = useRouter();
  const { t } = useTranslation();
  const { mutate: saveRally, isPending: isSaving } = useSaveRally();

  const isNameValid = rallyNameSchema.safeParse(name).success;
  const isEmojiValid = rallyEmojiSchema.safeParse(emoji).success;
  const canSave = isNameValid && isEmojiValid && !isSaving;

  const handleSave = () => {
    if (!canSave) return;

    saveRally({ name, emoji }, { onSuccess: () => back() });
  };

  return (
    <FormSheetLayout
      testID="create-rally-form"
      title={t("rallies.createRally")}
    >
      <RallyFormFields
        emoji={emoji}
        name={name}
        onChangeEmoji={setEmoji}
        onChangeName={setName}
        onSubmit={handleSave}
      />

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
