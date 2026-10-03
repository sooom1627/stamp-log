import { Pressable, Text, View } from "react-native";

type LoadErrorProps = {
  onRetry: () => void;
};

export function LoadError({ onRetry }: LoadErrorProps) {
  return (
    <View className="items-center gap-2 py-12">
      <Text selectable className="text-danger">
        Couldn't load
      </Text>
      <Pressable role="button" onPress={onRetry}>
        <Text className="text-foreground">Retry</Text>
      </Pressable>
    </View>
  );
}
