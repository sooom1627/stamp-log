import { useState } from "react";

import { useRouter } from "expo-router";

import { Button } from "@/shared/components/button";
import { FormSheetLayout } from "@/shared/components/form-sheet";

import { RallyFormFields } from "../components/rally-form-fields";
import { useCloseWhenMissing } from "../hooks/use-close-when-missing";
import { useRally, useUpdateRally } from "../hooks/use-rallies";
import {
  rallyEmojiSchema,
  rallyNameSchema,
  type Rally,
} from "../schemas/rallies";

type EditRallyScreenProps = {
  rallyId: number;
};

export function EditRallyScreen({ rallyId }: EditRallyScreenProps) {
  const { data: rally } = useRally(rallyId);

  // A rally that does not exist closes the sheet, like an invalid id.
  useCloseWhenMissing(rally === null);

  if (!rally) return null;

  return <EditRallyForm key={rally.id} rally={rally} />;
}

type EditRallyFormProps = {
  rally: Rally;
};

function EditRallyForm({ rally }: EditRallyFormProps) {
  const [emoji, setEmoji] = useState(rally.emoji);
  const [name, setName] = useState(rally.name);
  const { back } = useRouter();
  const { mutate: updateRally, isPending: isSaving } = useUpdateRally();

  const isNameValid = rallyNameSchema.safeParse(name).success;
  const isEmojiValid = rallyEmojiSchema.safeParse(emoji).success;
  const canSave = isNameValid && isEmojiValid && !isSaving;

  const handleSave = () => {
    if (!canSave) return;

    updateRally({ id: rally.id, name, emoji }, { onSuccess: back });
  };

  return (
    <FormSheetLayout testID="edit-rally-form" title="Edit rally">
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
