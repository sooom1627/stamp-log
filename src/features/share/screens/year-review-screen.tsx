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

import { useRouter } from "expo-router";

import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/shared/components/button";
import { X } from "@/shared/components/icons";
import {
  shareImageHeight,
  shareImageWidth,
} from "@/shared/components/share-image-frame";
import { useCloseWhenMissing } from "@/shared/hooks/use-close-when-missing";
import { useStampsBetween } from "@/shared/hooks/use-stamps";

import { yearPages, YearShareImage } from "../components/year-share-image";
import { useRalliesInHomeOrder } from "../hooks/use-rallies-in-home-order";
import { buildYearShare } from "../utils/year-share";

const PAGES = yearPages.map((_, index) => index + 1);
// The page's side margin, as the tab screens' px-5.
const PAGE_PADDING = 20;

type YearReviewScreenProps = {
  year: number;
};

// "Your year with Ato": the year in 4 pages drawn as the images they share
// as (docs/screens/year-review.md). Opens on the first page every time.
export function YearReviewScreen({ year }: YearReviewScreenProps) {
  const { back, push } = useRouter();
  const { t } = useTranslation();
  const { top, bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [pageIndex, setPageIndex] = useState(0);
  const { data: stamps } = useStampsBetween(
    new Date(year, 0, 1),
    new Date(year + 1, 0, 1),
  );
  const rallies = useRalliesInHomeOrder();

  // A year without stamps has nothing to look back on.
  useCloseWhenMissing(stamps?.length === 0);

  if (!stamps || stamps.length === 0 || !rallies) {
    return <View className="bg-canvas flex-1" />;
  }

  const share = buildYearShare(stamps, rallies);
  const scale = Math.min(1, (width - PAGE_PADDING * 2) / shareImageWidth);
  const handleMomentumScrollEnd = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPageIndex(Math.round(nativeEvent.contentOffset.x / width));
  };

  return (
    <View
      testID="year-review"
      className="from-canvas-top via-canvas-mid to-canvas-bottom flex-1 bg-linear-to-b"
      style={{ paddingTop: top, paddingBottom: bottom + 16 }}
    >
      <View className="flex-row items-center px-4 py-2">
        {/* Balances the close button so the title stays centered. */}
        <View className="size-11" />
        <Text
          role="heading"
          className="text-foreground text-headline flex-1 text-center font-semibold"
        >
          {t("share.yearReview", { year })}
        </Text>
        <Pressable
          role="button"
          aria-label={t("common.close")}
          onPress={() => back()}
          className="bg-surface size-11 items-center justify-center rounded-full active:opacity-70"
        >
          <X colorClassName="accent-foreground" size={20} strokeWidth={2} />
        </Pressable>
      </View>
      <FlatList
        testID="year-review-pages"
        data={PAGES}
        keyExtractor={String}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        renderItem={({ item: page }) => (
          <View style={{ width }} className="items-center justify-center">
            <View
              style={{
                width: shareImageWidth * scale,
                height: shareImageHeight * scale,
              }}
            >
              {/* Laid out at the image's size and shrunk, like the sheet's preview. */}
              <View
                style={{ transform: [{ scale }], transformOrigin: "top left" }}
              >
                <YearShareImage year={year} page={page} share={share} />
              </View>
            </View>
          </View>
        )}
      />
      <View className="items-center gap-4 px-5 pt-4">
        <View
          className="flex-row gap-2"
          aria-label={t("onboarding.page", {
            n: pageIndex + 1,
            total: PAGES.length,
          })}
        >
          {PAGES.map((page, index) => (
            <View
              key={page}
              className={
                index === pageIndex
                  ? "bg-foreground size-2 rounded-full"
                  : "bg-foreground/20 size-2 rounded-full"
              }
            />
          ))}
        </View>
        <Button
          className="self-stretch"
          label={t("share.share")}
          onPress={() =>
            push({
              pathname: "/share-year",
              params: { year, page: PAGES[pageIndex] },
            })
          }
        />
      </View>
    </View>
  );
}
