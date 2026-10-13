import { useState } from "react";

import { Pressable, Text, View } from "react-native";

import { useRouter } from "expo-router";

import {
  EmojiKeyboard,
  type EmojiType,
} from "@softwhere-uz/react-native-emoji-keyboard";

import { Button } from "@/shared/components/button";
import {
  FormField,
  FormSheetLayout,
  FormTextInput,
} from "@/shared/components/form-sheet";

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
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [name, setName] = useState(rally.name);
  const { back } = useRouter();
  const { mutate: updateRally, isPending: isSaving } = useUpdateRally();

  const isNameValid = rallyNameSchema.safeParse(name).success;
  const isEmojiValid = rallyEmojiSchema.safeParse(emoji).success;
  const canSave = isNameValid && isEmojiValid && !isSaving;

  const handleEmojiSelect = (selectedEmoji: EmojiType) => {
    setEmoji(selectedEmoji.emoji);
    setIsEmojiPickerOpen(false);
  };

  const handleSave = () => {
    if (!canSave) return;

    updateRally({ id: rally.id, name, emoji }, { onSuccess: back });
  };

  return (
    <FormSheetLayout testID="edit-rally-form" title="Edit rally">
      <View className="gap-6">
        <FormField label="Emoji">
          <Pressable
            role="button"
            aria-label={`Select emoji (currently ${emoji})`}
            onPress={() => setIsEmojiPickerOpen((isOpen) => !isOpen)}
            className="border-continuous border-border bg-surface-muted active:bg-surface-muted-active flex-row items-center gap-3 rounded-2xl border px-4 py-3"
          >
            <Text className="text-3xl">{emoji}</Text>
            <Text className="text-foreground-muted flex-1 text-sm">
              Tap to change
            </Text>
          </Pressable>
          {isEmojiPickerOpen ? (
            <View className="border-continuous border-border h-80 overflow-hidden rounded-2xl border">
              <EmojiKeyboard
                onEmojiSelected={handleEmojiSelect}
                hideHeader
                enableSearchBar
                categoryPosition="top"
                defaultHeight={320}
                disableSafeArea
              />
            </View>
          ) : null}
        </FormField>

        <FormField label="Name">
          <FormTextInput
            value={name}
            onChangeText={setName}
            onFocus={() => setIsEmojiPickerOpen(false)}
            onSubmitEditing={handleSave}
            placeholder="Enter a rally name"
            aria-label="Name"
            returnKeyType="done"
            submitBehavior="blurAndSubmit"
          />
        </FormField>
      </View>

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
