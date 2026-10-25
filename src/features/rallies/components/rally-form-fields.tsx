import { useState } from "react";

import { Pressable, Text, View } from "react-native";

import {
  EmojiKeyboard,
  type EmojiType,
} from "@softwhere-uz/react-native-emoji-keyboard";

import { FormField, FormTextInput } from "@/shared/components/form-sheet";

type RallyFormFieldsProps = {
  emoji: string;
  name: string;
  onChangeEmoji: (emoji: string) => void;
  onChangeName: (name: string) => void;
  onSubmit: () => void;
};

// The emoji and name fields of the create and edit rally sheets.
export function RallyFormFields({
  emoji,
  name,
  onChangeEmoji,
  onChangeName,
  onSubmit,
}: RallyFormFieldsProps) {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const handleEmojiSelect = (selectedEmoji: EmojiType) => {
    onChangeEmoji(selectedEmoji.emoji);
    setIsEmojiPickerOpen(false);
  };

  return (
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
          onChangeText={onChangeName}
          onFocus={() => setIsEmojiPickerOpen(false)}
          onSubmitEditing={onSubmit}
          placeholder="Enter a rally name"
          aria-label="Name"
          testID="rally-name-input"
          returnKeyType="done"
          submitBehavior="blurAndSubmit"
        />
      </FormField>
    </View>
  );
}
