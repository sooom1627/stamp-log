import { useState, type ReactNode } from "react";

import { Text, useWindowDimensions, View } from "react-native";

import { SwipePages } from "@/shared/components/swipe-pages";
import { type AlbumTile } from "@/shared/utils/album-photos";

import { AlbumGrid } from "./album-grid";
import { stampsViews, type StampsView } from "./stamps-album-picker";

type StampsAlbumPagerProps = {
  // The pager is `${testIDPrefix}-pager`, each page `${testIDPrefix}-page-${view}`.
  testIDPrefix: string;
  view: StampsView;
  onChangeView: (view: StampsView) => void;
  pageClassName: string;
  // What the Stamps page shows: the day cards of the timeline.
  stamps: ReactNode;
  tiles: AlbumTile[];
  showsEmoji: boolean;
};

// The Stamps and Album pages under the StampsAlbumPicker, inside the screen's
// scroll: the pager takes the measured height of the page it shows.
export function StampsAlbumPager({
  testIDPrefix,
  view,
  onChangeView,
  pageClassName,
  stamps,
  tiles,
  showsEmoji,
}: StampsAlbumPagerProps) {
  const { height: windowHeight } = useWindowDimensions();
  const [pageHeights, setPageHeights] = useState<Record<StampsView, number>>({
    stamps: 0,
    album: 0,
  });

  return (
    <SwipePages
      testID={`${testIDPrefix}-pager`}
      values={stampsViews}
      value={view}
      onChange={onChangeView}
      // Zero until measured would hide the pages (and keep them from being
      // measured), so start a screen tall.
      height={pageHeights[view] || windowHeight}
      renderPage={(page) => (
        // The page fills the pager; this measures what it holds.
        <View
          testID={`${testIDPrefix}-page-${page}`}
          className={pageClassName}
          onLayout={({ nativeEvent: { layout } }) =>
            setPageHeights((heights) => ({
              ...heights,
              [page]: layout.height,
            }))
          }
        >
          {page === "stamps" ? (
            stamps
          ) : tiles.length === 0 ? (
            <View className="items-center py-12">
              <Text className="text-foreground-secondary">No photos yet</Text>
            </View>
          ) : (
            <AlbumGrid tiles={tiles} showsEmoji={showsEmoji} />
          )}
        </View>
      )}
    />
  );
}
