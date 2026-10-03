import { useState } from "react";

import { Pressable, Text, TextInput, View } from "react-native";

import { useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";

import {
  EmojiKeyboard,
  type EmojiType,
} from "@softwhere-uz/react-native-emoji-keyboard";

import { Button } from "@/shared/components/button";

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

// Do not use ScrollView / KeyboardAvoidingView inside formSheet.
// react-native-screens force-overrides the ScrollView frame to the full sheet,
// which interferes with sibling content (footer) and stops rendering.
// Keep the root intrinsically sized so fitToContents includes the Save button.
export function CreateRallyScreen() {
  const [selectedType, setSelectedType] = useState<RallyType>(
    rallyTypeSchema.options[0],
  );
  const [emoji, setEmoji] = useState(rallyTypeEmojis[selectedType]);
  const [isEmojiCustomized, setIsEmojiCustomized] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [name, setName] = useState("");
  const { back } = useRouter();
  const headerHeight = useHeaderHeight();
  const save = useSaveRally();

  const isNameValid = rallyNameSchema.safeParse(name).success;
  const isEmojiValid = rallyEmojiSchema.safeParse(emoji).success;
  const canSave = isNameValid && isEmojiValid && !save.isPending;

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

    save.mutate({ name, type: selectedType, emoji }, { onSuccess: back });
  };

  return (
    <View
      testID="create-rally-form"
      className="bg-background px-5 pb-6"
      style={{ paddingTop: headerHeight + 16 }}
    >
      <View className="gap-6">
        <View className="gap-2">
          <Text className="text-foreground text-sm font-semibold">Type</Text>
          <RallyTypeRadios value={selectedType} onChange={handleTypeChange} />
        </View>

        <View className="gap-2">
          <Text className="text-foreground text-sm font-semibold">Emoji</Text>
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
        </View>

        <View className="gap-2">
          <Text className="text-foreground text-sm font-semibold">Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            onFocus={() => setIsEmojiPickerOpen(false)}
            onSubmitEditing={handleSave}
            placeholder={rallyNamePlaceholders[selectedType]}
            aria-label="Name"
            returnKeyType="done"
            submitBehavior="blurAndSubmit"
            className="border-continuous border-border bg-surface-muted text-foreground focus:border-accent rounded-2xl border px-4 py-3.5 text-base"
            cursorColorClassName="accent-accent"
            selectionColorClassName="accent-accent"
            placeholderTextColorClassName="accent-text-muted"
          />
        </View>
      </View>

      <Button
        label={save.isPending ? "Saving…" : "Save"}
        onPress={handleSave}
        disabled={!canSave}
        isLoading={save.isPending}
        className="mt-8"
      />
    </View>
  );
}
