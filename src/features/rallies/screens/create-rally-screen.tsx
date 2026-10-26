import { useState } from "react";

import { useRouter } from "expo-router";

import { Button } from "@/shared/components/button";
import { FormSheetLayout } from "@/shared/components/form-sheet";

import { RallyFormFields } from "../components/rally-form-fields";
import { useSaveRally } from "../hooks/use-rallies";
import {
  defaultRallyEmoji,
  rallyEmojiSchema,
  rallyNameSchema,
} from "../schemas/rallies";

export function CreateRallyScreen() {
  const [emoji, setEmoji] = useState(defaultRallyEmoji);
  const [name, setName] = useState("");
  const { back } = useRouter();
  const { mutate: saveRally, isPending: isSaving } = useSaveRally();

  const isNameValid = rallyNameSchema.safeParse(name).success;
  const isEmojiValid = rallyEmojiSchema.safeParse(emoji).success;
  const canSave = isNameValid && isEmojiValid && !isSaving;

  const handleSave = () => {
    if (!canSave) return;

    saveRally({ name, emoji }, { onSuccess: () => back() });
  };

  return (
    <FormSheetLayout testID="create-rally-form" title="Create rally">
      <RallyFormFields
        emoji={emoji}
        name={name}
        onChangeEmoji={setEmoji}
        onChangeName={setName}
        onSubmit={handleSave}
      />

      <Button
        label="Save"
        loadingLabel="Saving…"
        onPress={handleSave}
        disabled={!canSave}
        isLoading={isSaving}
        className="mt-8"
      />
    </FormSheetLayout>
  );
}
