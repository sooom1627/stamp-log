import { Text, View } from "react-native";

import type { ErrorBoundaryProps } from "expo-router";

import { useTranslation } from "react-i18next";

import { Button } from "./button";

type RenderErrorProps = Pick<ErrorBoundaryProps, "retry">;

/** Replaces a route whose render threw; `retry` renders it again. */
export function RenderError({ retry }: RenderErrorProps) {
  const { t } = useTranslation();

  return (
    <View className="bg-background flex-1 justify-center gap-6 px-6">
      <View className="items-center gap-2">
        <Text className="text-foreground text-xl font-semibold">
          {t("errors.renderTitle")}
        </Text>
        <Text className="text-foreground-secondary text-base">
          {t("errors.renderBody")}
        </Text>
      </View>
      <Button label={t("errors.tryAgain")} onPress={() => void retry()} />
    </View>
  );
}
