import { Text, View } from "react-native";

import type { ErrorBoundaryProps } from "expo-router";

import { Button } from "./button";

type RenderErrorProps = Pick<ErrorBoundaryProps, "retry">;

/** Replaces a route whose render threw; `retry` renders it again. */
export function RenderError({ retry }: RenderErrorProps) {
  return (
    <View className="bg-background flex-1 justify-center gap-6 px-6">
      <View className="items-center gap-2">
        <Text className="text-foreground text-xl font-semibold">
          Something went wrong
        </Text>
        <Text className="text-foreground-secondary text-base">
          This screen couldn't be shown.
        </Text>
      </View>
      <Button label="Try again" onPress={() => void retry()} />
    </View>
  );
}
