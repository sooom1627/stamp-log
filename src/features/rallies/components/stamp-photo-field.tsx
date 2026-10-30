import { Pressable, Text, View } from "react-native";

import { Image } from "expo-image";
import { launchImageLibraryAsync } from "expo-image-picker";

import { useTranslation } from "react-i18next";
import { withUniwind } from "uniwind";

import { Plus, X } from "@/shared/components/icons";
import { maxStampPhotos } from "@/shared/schemas/stamps";

const StyledImage = withUniwind(Image);

type StampPhotoFieldProps = {
  photoUris: string[];
  onChangePhotoUris: (photoUris: string[]) => void;
};

// Photos picked from the library, up to 4 (S-035). Kept in the order picked.
export function StampPhotoField({
  photoUris,
  onChangePhotoUris,
}: StampPhotoFieldProps) {
  const remaining = maxStampPhotos - photoUris.length;
  // Four slots so the tiles keep their width whatever the count.
  const emptySlots = Math.max(remaining - 1, 0);
  const { t } = useTranslation();

  const handleAdd = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      orderedSelection: true,
    });
    if (result.canceled) return;

    // The limit is a request to the system picker; cap it here as well.
    const picked = result.assets.map((asset) => asset.uri);
    onChangePhotoUris([...photoUris, ...picked].slice(0, maxStampPhotos));
  };

  const handleRemove = (index: number) => {
    onChangePhotoUris(photoUris.filter((_, i) => i !== index));
  };

  return (
    <View className="gap-2">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-foreground text-sm font-semibold">
          {t("stampForm.photos")}
        </Text>
        <Text className="text-foreground-muted text-sm">
          {`${photoUris.length} / ${maxStampPhotos}`}
        </Text>
      </View>
      <View className="flex-row gap-2">
        {photoUris.map((uri, index) => (
          <View key={`${index}-${uri}`} className="aspect-square flex-1">
            <StyledImage
              source={{ uri }}
              contentFit="cover"
              className="border-continuous bg-surface-muted size-full rounded-xl"
            />
            <Pressable
              role="button"
              aria-label={t("stampForm.removePhoto", { n: index + 1 })}
              hitSlop={8}
              className="bg-inverse border-background absolute -top-1.5 -right-1.5 size-6 items-center justify-center rounded-full border-2 active:opacity-70"
              onPress={() => handleRemove(index)}
            >
              <X colorClassName="accent-white" size={12} strokeWidth={3} />
            </Pressable>
          </View>
        ))}
        {remaining > 0 ? (
          <Pressable
            role="button"
            aria-label={t("stampForm.addPhotos")}
            className="border-continuous border-border aspect-square flex-1 items-center justify-center gap-0.5 rounded-xl border-[1.5px] border-dashed active:opacity-70"
            onPress={handleAdd}
          >
            <Plus
              colorClassName="accent-text-muted"
              size={20}
              strokeWidth={2}
            />
            <Text className="text-foreground-secondary text-xs">
              {t("stampForm.add")}
            </Text>
          </Pressable>
        ) : null}
        {Array.from({ length: emptySlots }, (_, index) => (
          <View key={`empty-${index}`} className="flex-1" />
        ))}
      </View>
    </View>
  );
}
