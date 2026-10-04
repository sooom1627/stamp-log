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

import { RallyTypeRadios } from "../components/rally-type-radios";
import { useSaveRally } from "../hooks/use-rallies";
import {
  rallyEmojiSchema,
  rallyNameSchema,
  rallyTypeEmojis,
  rallyTypeSchema,
  type RallyType,
} from "../schemas/rallies";

const rallyNamePlaceholders: Record<RallyType, string> = {
  place: "Enter a place to track",
  action: "Enter an action to track",
  person: "Enter a person to track",
};

export function CreateRallyScreen() {
  const [selectedType, setSelectedType] = useState<RallyType>(
    rallyTypeSchema.options[0],
  );
  const [emoji, setEmoji] = useState(rallyTypeEmojis[selectedType]);
  const [isEmojiCustomized, setIsEmojiCustomized] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [name, setName] = useState("");
  const { back } = useRouter();
  const { mutate: saveRally, isPending: isSaving } = useSaveRally();

  const isNameValid = rallyNameSchema.safeParse(name).success;
  const isEmojiValid = rallyEmojiSchema.safeParse(emoji).success;
  const canSave = isNameValid && isEmojiValid && !isSaving;

  const handleTypeChange = (type: RallyType) => {
    setSelectedType(type);
    if (!isEmojiCustomized) setEmoji(rallyTypeEmojis[type]);
  };

  const handleEmojiSelect = (selectedEmoji: EmojiType) => {
    setEmoji(selectedEmoji.emoji);
    setIsEmojiCustomized(true);
    setIsEmojiPickerOpen(false);
  };

  const handleSave = () => {
    if (!canSave) return;

    saveRally({ name, type: selectedType, emoji }, { onSuccess: back });
  };

  return (
    <FormSheetLayout testID="create-rally-form" title="Create rally">
      <View className="gap-6">
        <FormField label="Type">
          <RallyTypeRadios value={selectedType} onChange={handleTypeChange} />
        </FormField>

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
            placeholder={rallyNamePlaceholders[selectedType]}
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
