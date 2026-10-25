import { Text, View } from "react-native";

import { LoadError } from "./load-error";

type TimelineEmptyProps = {
  isError: boolean;
  isLoaded: boolean;
  message: string;
  onRetry: () => void;
};

// Nothing while loading, so No stamps yet never flashes before the posts.
export function TimelineEmpty({
  isError,
  isLoaded,
  message,
  onRetry,
}: TimelineEmptyProps) {
  if (isError) return <LoadError onRetry={onRetry} />;
  if (!isLoaded) return null;

  return (
    <View className="items-center py-12">
      <Text className="text-foreground-secondary">{message}</Text>
    </View>
  );
}
