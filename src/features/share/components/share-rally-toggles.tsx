import { Pressable, Text, View } from "react-native";

import { useTranslation } from "react-i18next";

import { type Rally } from "@/shared/schemas/rallies";

type ShareRallyTogglesProps = {
  rallies: Rally[];
  excludedIds: ReadonlySet<Rally["id"]>;
  onToggle: (rallyId: Rally["id"]) => void;
};

// The month and year sheets' "Rallies in the image": one round tag per rally,
// so a private rally can be left out of what is sent
// (docs/screens/share-image.md).
export function ShareRallyToggles({
  rallies,
  excludedIds,
  onToggle,
}: ShareRallyTogglesProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-2">
      <Text className="text-foreground-muted text-footnote">
        {t("share.ralliesInImage")}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {rallies.map((rally) => {
          const isIncluded = !excludedIds.has(rally.id);
          return (
            <Pressable
              key={rally.id}
              role="checkbox"
              aria-checked={isIncluded}
              aria-label={`${rally.emoji} ${rally.name}`}
              hitSlop={5}
              onPress={() => onToggle(rally.id)}
              className={`max-w-full flex-row items-center gap-1 rounded-full px-3 py-2 active:opacity-70 ${
                isIncluded ? "bg-primary" : "border-border border"
              }`}
            >
              <Text className="text-footnote">{rally.emoji}</Text>
              <Text
                numberOfLines={1}
                className={`text-footnote shrink font-semibold ${
                  isIncluded
                    ? "text-primary-foreground"
                    : "text-foreground-muted"
                }`}
              >
                {rally.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
