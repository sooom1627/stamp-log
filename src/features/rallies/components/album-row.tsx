import { Pressable, Text, View } from "react-native";

import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { formatStampDateTime } from "@/shared/utils/format-stamp-date-time";

import { type AlbumPhoto } from "../utils/album-photos";

const COLUMNS = 3;

// The Album grid as rows of three, so it can share one list with the
// timeline (a list cannot change its column count while shown).
export function albumRows(photos: AlbumPhoto[]) {
  const rows: AlbumPhoto[][] = [];
  for (let index = 0; index < photos.length; index += COLUMNS) {
    rows.push(photos.slice(index, index + COLUMNS));
  }
  return rows;
}

type AlbumRowProps = {
  photos: AlbumPhoto[];
  // Logs mixes rallies, so its tiles show whose photo it is.
  showsEmoji: boolean;
};

export function AlbumRow({ photos, showsEmoji }: AlbumRowProps) {
  const { push } = useRouter();
  const emptyCount = COLUMNS - photos.length;

  return (
    <View className="flex-row gap-0.5">
      {photos.map(({ id, uri, emoji, rallyName, stampedAt }) => (
        <Pressable
          key={id}
          role="button"
          aria-label={`Open photo, ${rallyName}, ${formatStampDateTime(new Date(stampedAt))}`}
          onPress={() =>
            push({ pathname: "/stamp-photos", params: { photoId: id } })
          }
          className="bg-surface-muted aspect-square flex-1"
        >
          <Image source={{ uri }} contentFit="cover" style={{ flex: 1 }} />
          {showsEmoji ? (
            <View className="bg-surface border-continuous absolute bottom-1.5 left-1.5 size-6 items-center justify-center rounded-lg">
              <Text aria-hidden className="text-xs">
                {emoji}
              </Text>
            </View>
          ) : null}
        </Pressable>
      ))}
      {/* Keeps the last row's tiles the same width as the others. */}
      {Array.from({ length: emptyCount }, (_, index) => (
        <View key={`empty-${index}`} className="aspect-square flex-1" />
      ))}
    </View>
  );
}
