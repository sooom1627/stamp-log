import { Pressable, Text, View } from "react-native";

type MockEmojiKeyboardProps = {
  onEmojiSelected: (emoji: { emoji: string }) => void;
  hideHeader?: boolean;
};

export function EmojiKeyboard({
  onEmojiSelected,
  hideHeader,
}: MockEmojiKeyboardProps) {
  return (
    <View testID="emoji-picker">
      {!hideHeader ? <View testID="emoji-color-selector" /> : null}
      {["🔬", "🎯"].map((emoji) => (
        <Pressable
          key={emoji}
          role="button"
          accessibilityLabel={`${emoji}を選ぶ`}
          onPress={() => onEmojiSelected({ emoji })}
        >
          <Text>{emoji}</Text>
        </Pressable>
      ))}
    </View>
  );
}
