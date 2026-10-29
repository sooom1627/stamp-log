import { Pressable, Text, View } from "react-native";

import { useTranslation } from "react-i18next";

type LoadErrorProps = {
  onRetry: () => void;
};

export function LoadError({ onRetry }: LoadErrorProps) {
  const { t } = useTranslation();

  return (
    <View className="items-center gap-2 py-12">
      <Text selectable className="text-danger">
        {t("errors.couldNotLoad")}
      </Text>
      <Pressable role="button" onPress={onRetry}>
        <Text className="text-foreground">{t("common.retry")}</Text>
      </Pressable>
    </View>
  );
}
