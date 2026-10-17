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
import { formatStampDateTime } from "@/shared/utils/format-stamp-date-time";

import { stampPhotoUri } from "../db/stamp-photo-files";
import { useCloseWhenMissing } from "../hooks/use-close-when-missing";
import { useRally } from "../hooks/use-rallies";
import { useStamps } from "../hooks/use-stamps";
import { type Rally } from "../schemas/rallies";
import { type Stamp, type StampPhoto } from "../schemas/stamps";

type StampPhotosScreenProps = {
  photoId: StampPhoto["id"];
};

// The photos of the stamp that holds `photoId`, opened at that photo (S-037).
export function StampPhotosScreen({ photoId }: StampPhotosScreenProps) {
  const { data: stamps } = useStamps();
  // undefined while loading, null once loaded without the photo.
  const stamp =
    stamps === undefined
      ? undefined
      : (stamps.find(({ photos }) => photos.some(({ id }) => id === photoId)) ??
        null);
  const { data: rally } = useRally(stamp?.rallyId);

  // A photo that does not exist (or was removed meanwhile) closes the screen.
  useCloseWhenMissing(
    stamp === null || (stamp !== undefined && rally === null),
  );

  if (!stamp || !rally) {
    return <View className="bg-photo-viewer flex-1" />;
  }

  const startIndex = stamp.photos.findIndex(({ id }) => id === photoId);

  return (
    <StampPhotosPager
      key={stamp.id}
      stamp={stamp}
      rally={rally}
      startIndex={startIndex}
    />
  );
}

type StampPhotosPagerProps = {
  stamp: Stamp;
  rally: Rally;
  startIndex: number;
};

function StampPhotosPager({ stamp, rally, startIndex }: StampPhotosPagerProps) {
  const { photos } = stamp;
  const [index, setIndex] = useState(startIndex);
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
          onPress={back}
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
            {formatStampDateTime(new Date(stamp.stampedAt))}
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
              source={{ uri: stampPhotoUri(item.fileName) }}
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
