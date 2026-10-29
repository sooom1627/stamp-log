import { Pressable, Text, View } from "react-native";

import { Image } from "expo-image";
import { Link } from "expo-router";

import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import { type AlbumTile } from "@/shared/utils/album-photos";
import { formatSpokenDate } from "@/shared/utils/format-spoken-date";

import { ImageIcon } from "./icons";

const COLUMNS = 3;

function albumRows(tiles: AlbumTile[]) {
  const rows: AlbumTile[][] = [];
  for (let index = 0; index < tiles.length; index += COLUMNS) {
    rows.push(tiles.slice(index, index + COLUMNS));
  }
  return rows;
}

function tileLabel(
  t: TFunction,
  { photoCount, rallyName, stampedAt }: AlbumTile,
) {
  const rally = rallyName;
  const date = formatSpokenDate(new Date(stampedAt));
  if (photoCount === 1) return t("stamps.openPhoto", { rally, date });
  return t("stamps.openPhotos", {
    photos: `${photoCount} photos`,
    rally,
    date,
  });
}

type AlbumRowProps = {
  tiles: AlbumTile[];
  // Logs mixes rallies, so its tiles show whose photos they are.
  showsEmoji: boolean;
};

// One tile per day and rally (S-037 T-003): its first photo, opening the
// viewer there to page through the rest.
function AlbumRow({ tiles, showsEmoji }: AlbumRowProps) {
  const emptyCount = COLUMNS - tiles.length;
  const { t } = useTranslation();

  return (
    <View className="flex-row gap-0.5">
      {tiles.map((tile) => (
        <Link
          key={tile.key}
          href={{
            pathname: "/stamp-photos",
            params: { photoId: tile.coverPhotoId },
          }}
          asChild
        >
          <Pressable
            role="button"
            aria-label={tileLabel(t, tile)}
            className="bg-surface-muted aspect-square flex-1"
          >
            <Image
              testID="album-tile-image"
              source={{ uri: tile.coverUri }}
              // A file on the device: keep the decoded image in memory only.
              cachePolicy="memory"
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
        </Link>
      ))}
      {/* Keeps the last row's tiles the same width as the others. */}
      {Array.from({ length: emptyCount }, (_, index) => (
        <View key={`empty-${index}`} className="aspect-square flex-1" />
      ))}
    </View>
  );
}

// The tiles in rows of three, as one surface: only the grid's outer corners
// are rounded, not each tile (S-037 T-006).
export function AlbumGrid({ tiles, showsEmoji }: AlbumRowProps) {
  return (
    <View
      testID="album-grid"
      className="border-continuous gap-0.5 overflow-hidden rounded-2xl"
    >
      {albumRows(tiles).map((row) => (
        <AlbumRow
          key={`row-${row[0].key}`}
          tiles={row}
          showsEmoji={showsEmoji}
        />
      ))}
    </View>
  );
}
