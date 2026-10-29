import { useState } from "react";

import {
  FlatList,
  Pressable,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { X } from "@/shared/components/icons";
import { useRally } from "@/shared/hooks/use-rallies";
import { usePhotoDayStamps } from "@/shared/hooks/use-stamps";
import { type Rally } from "@/shared/schemas/rallies";
import { type StampPhoto } from "@/shared/schemas/stamps";
import {
  dayRallyPhotos,
  type DayRallyPhoto,
} from "@/shared/utils/album-photos";
import { formatStampDateTime } from "@/shared/utils/format-stamp-date-time";

import { useCloseWhenMissing } from "../hooks/use-close-when-missing";

type StampPhotosScreenProps = {
  photoId: StampPhoto["id"];
};

// The photos of `photoId`'s rally on its local day, opened at that photo
// (S-037). Usually that is one stamp's photos.
export function StampPhotosScreen({ photoId }: StampPhotosScreenProps) {
  const { data: stamps } = usePhotoDayStamps(photoId);
  // undefined while loading, empty once loaded without the photo.
  const photos =
    stamps === undefined ? undefined : dayRallyPhotos(stamps, photoId);
  const { data: rally } = useRally(photos?.[0]?.rallyId);
  const isMissing = photos?.length === 0;

  // A photo that does not exist (or was removed meanwhile) closes the screen.
  useCloseWhenMissing(isMissing || (photos !== undefined && rally === null));

  if (!photos || isMissing || !rally) {
    return <View className="bg-photo-viewer flex-1" />;
  }

  const startIndex = photos.findIndex(({ id }) => id === photoId);

  return (
    <StampPhotosPager
      key={photos[0].id}
      photos={photos}
      rally={rally}
      startIndex={startIndex}
    />
  );
}

type StampPhotosPagerProps = {
  photos: DayRallyPhoto[];
  rally: Rally;
  startIndex: number;
};

function StampPhotosPager({
  photos,
  rally,
  startIndex,
}: StampPhotosPagerProps) {
  const [pageIndex, setIndex] = useState(startIndex);
  // A photo removed while open shortens the list; stay on a real page.
  const index = Math.min(pageIndex, photos.length - 1);
  const { width } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const { back } = useRouter();
  const hasSeveral = photos.length > 1;

  const handleMomentumScrollEnd = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(nativeEvent.contentOffset.x / width));
  };

  return (
    <View
      className="bg-photo-viewer flex-1"
      style={{ paddingTop: top, paddingBottom: bottom + 16 }}
    >
      <View className="flex-row items-center px-4 py-2">
        <Pressable
          role="button"
          aria-label="Close"
          onPress={() => back()}
          className="bg-photo-viewer-control size-11 items-center justify-center rounded-full"
        >
          <X
            colorClassName="accent-photo-viewer-foreground"
            size={20}
            strokeWidth={2}
          />
        </Pressable>
        <View className="flex-1 items-center gap-0.5">
          <Text className="text-photo-viewer-foreground text-base font-semibold">
            {`${rally.emoji} ${rally.name}`}
          </Text>
          <Text className="text-photo-viewer-muted text-sm">
            {formatStampDateTime(new Date(photos[index].stampedAt))}
          </Text>
        </View>
        {/* Balances the close button so the title stays centered. */}
        <View className="size-11" />
      </View>
      <FlatList
        testID="stamp-photos-pages"
        data={photos}
        keyExtractor={({ id }) => String(id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={startIndex}
        getItemLayout={(_, itemIndex) => ({
          length: width,
          offset: width * itemIndex,
          index: itemIndex,
        })}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        renderItem={({ item, index: itemIndex }) => (
          <View
            role="img"
            aria-label={`Photo ${itemIndex + 1} of ${photos.length}`}
            style={{ width }}
          >
            <Image
              source={{ uri: item.uri }}
              contentFit="contain"
              style={{ flex: 1 }}
            />
          </View>
        )}
      />
      {hasSeveral ? (
        <View className="items-center gap-2 pt-4">
          <View className="flex-row gap-2">
            {photos.map(({ id }, dotIndex) => (
              <View
                key={id}
                className={
                  dotIndex === index
                    ? "bg-photo-viewer-foreground size-2 rounded-full"
                    : "bg-photo-viewer-muted size-2 rounded-full"
                }
              />
            ))}
          </View>
          <Text className="text-photo-viewer-muted text-sm">
            {`${index + 1} / ${photos.length}`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
