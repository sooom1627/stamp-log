import { Pressable, Text, View } from "react-native";

import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { ImageIcon } from "@/shared/components/icons";
import { formatStampDate } from "@/shared/utils/format-stamp-date-time";

import { type AlbumTile } from "../utils/album-photos";

const COLUMNS = 3;

// The Album grid as rows of three, so it can share one list with the
// timeline (a list cannot change its column count while shown).
export function albumRows(tiles: AlbumTile[]) {
  const rows: AlbumTile[][] = [];
  for (let index = 0; index < tiles.length; index += COLUMNS) {
    rows.push(tiles.slice(index, index + COLUMNS));
  }
  return rows;
}

function tileLabel({ photoCount, rallyName, stampedAt }: AlbumTile) {
  const photos = photoCount === 1 ? "photo" : `${photoCount} photos`;
  return `Open ${photos}, ${rallyName}, ${formatStampDate(new Date(stampedAt))}`;
}

type AlbumRowProps = {
  tiles: AlbumTile[];
  // Logs mixes rallies, so its tiles show whose photos they are.
  showsEmoji: boolean;
};

// One tile per day and rally (S-037 T-003): its first photo, opening the
// viewer there to page through the rest.
export function AlbumRow({ tiles, showsEmoji }: AlbumRowProps) {
  const { push } = useRouter();
  const emptyCount = COLUMNS - tiles.length;

  return (
    <View className="flex-row gap-0.5">
      {tiles.map((tile) => (
        <Pressable
          key={tile.key}
          role="button"
          aria-label={tileLabel(tile)}
          onPress={() =>
            push({
              pathname: "/stamp-photos",
              params: { photoId: tile.coverPhotoId },
            })
          }
          className="bg-surface-muted aspect-square flex-1"
        >
          <Image
            source={{ uri: tile.coverUri }}
            contentFit="cover"
            style={{ flex: 1 }}
          />
          {showsEmoji ? (
            <View className="bg-surface border-continuous absolute bottom-1.5 left-1.5 size-6 items-center justify-center rounded-lg">
              <Text aria-hidden className="text-xs">
                {tile.emoji}
              </Text>
            </View>
          ) : null}
          {tile.photoCount > 1 ? (
            <View
              aria-hidden
              className="bg-photo-viewer/70 absolute right-1.5 bottom-1.5 flex-row items-center gap-1 rounded-full px-1.5 py-0.5"
            >
              <ImageIcon
                colorClassName="accent-photo-viewer-foreground"
                size={12}
                strokeWidth={2.2}
              />
              <Text className="text-photo-viewer-foreground text-xs font-semibold">
                {tile.photoCount}
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
