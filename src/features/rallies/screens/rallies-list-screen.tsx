import { useCallback, useState } from "react";

import { ScrollView, Text, useWindowDimensions, View } from "react-native";

import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { Button, Host, Picker, Text as SwiftText } from "@expo/ui/swift-ui";
import { pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";

import { useTranslation } from "react-i18next";

import { LoadError } from "@/shared/components/load-error";
import { SwipePages } from "@/shared/components/swipe-pages";
import { useRalliesAndStamps } from "@/shared/hooks/use-rallies-and-stamps";
import { useSaveStamp, useStampSummary } from "@/shared/hooks/use-stamps";
import { useToday } from "@/shared/hooks/use-today";
import { type Rally } from "@/shared/schemas/rallies";

import { RallyTile } from "../components/rally-tile";
import { showAddMemoToast } from "../components/show-add-memo-toast";
import { sortRalliesForHome } from "../utils/sort-rallies-for-home";
import { stampDatesByRally } from "../utils/stamp-dates-by-rally";

// Matches the screen's px-5 and the grid's gap-2.5.
const SCREEN_PADDING = 20;
const TILE_GAP = 10;

type RalliesFilter = "all" | "favorites" | "archived";

const filters = [
  { value: "all", label: "rallies.all", empty: "rallies.noRallies" },
  {
    value: "favorites",
    label: "rallies.favorites",
    empty: "rallies.noFavorites",
  },
  { value: "archived", label: "rallies.archived", empty: "rallies.noArchived" },
] as const satisfies {
  value: RalliesFilter;
  label: string;
  empty: string;
}[];
const filterValues = filters.map(({ value }) => value);

function isInFilter(rally: Rally, filter: RalliesFilter) {
  if (filter === "archived") return rally.isArchived;
  if (rally.isArchived) return false;
  return filter === "favorites" ? rally.isFavorite : true;
}

export function RalliesListScreen() {
  const { push } = useRouter();
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();
  const { width: windowWidth } = useWindowDimensions();
  const tileWidth = (windowWidth - SCREEN_PADDING * 2 - TILE_GAP) / 2;
  const [filter, setFilter] = useState<RalliesFilter>("all");
  const {
    rallies,
    stamps: summary,
    isError: isListError,
    retry: retryLists,
  } = useRalliesAndStamps(useStampSummary(useToday()));
  const { mutate: saveStamp } = useSaveStamp();

  // Same as home: the order is fixed while the list is open, so a tile does
  // not jump away while it is being stamped.
  const [orderCounts, setOrderCounts] = useState<ReadonlyMap<
    Rally["id"],
    number
  > | null>(null);
  const [shouldResort, setShouldResort] = useState(true);
  useFocusEffect(useCallback(() => setShouldResort(true), []));
  if (shouldResort && summary) {
    setShouldResort(false);
    setOrderCounts(summary.countsByRally);
  }
  const datesByRally = stampDatesByRally(summary?.recentStamps ?? []);
  const openCreateRally = () => push("/create-rally");
  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel={t("rallies.createRally")}
          icon="plus"
          onPress={openCreateRally}
        />
      </Stack.Toolbar>
      {/* The header is transparent, so the fixed top starts below it. */}
      <View
        aria-label={t("rallies.listLabel")}
        className="bg-canvas flex-1"
        style={{ paddingTop: headerHeight }}
      >
        <View className="gap-4 px-5 pt-2">
          {/* The native toolbar button is not in the RN tree; tests press this. */}
          {process.env.NODE_ENV === "test" ? (
            <Host matchContents>
              <Button
                testID="rallies-list-create"
                label={t("rallies.createRally")}
                systemImage="plus"
                onPress={openCreateRally}
              />
            </Host>
          ) : null}
          <Text role="heading" className="text-foreground text-2xl font-bold">
            Your Days
          </Text>
          <Host matchContents={{ vertical: true }}>
            <Picker
              testID="rallies-list-filter"
              selection={filter}
              onSelectionChange={setFilter}
              modifiers={[pickerStyle("segmented")]}
            >
              {filters.map(({ value, label }) => (
                <SwiftText key={value} modifiers={[tag(value)]}>
                  {t(label)}
                </SwiftText>
              ))}
            </Picker>
          </Host>
          {isListError ? <LoadError onRetry={retryLists} /> : null}
        </View>
        <SwipePages
          testID="rallies-list-pager"
          values={filterValues}
          value={filter}
          onChange={setFilter}
          renderPage={(page) => {
            const shownRallies = rallies
              ? sortRalliesForHome(
                  rallies.filter((rally) => isInFilter(rally, page)),
                  orderCounts ?? summary?.countsByRally ?? new Map(),
                )
              : undefined;
            return (
              <ScrollView
                contentContainerClassName="px-5 pt-4 pb-32"
                contentInsetAdjustmentBehavior="automatic"
              >
                {shownRallies?.length === 0 ? (
                  <Text className="text-foreground-muted py-12 text-center text-sm">
                    {t(
                      filters.find(({ value }) => value === page)?.empty ??
                        "rallies.noRallies",
                    )}
                  </Text>
                ) : null}
                {shownRallies?.length ? (
                  <View
                    className="flex-row flex-wrap gap-2.5"
                    testID="rally-grid"
                  >
                    {shownRallies.map((rally) => (
                      <RallyTile
                        key={rally.id}
                        rallyId={rally.id}
                        name={rally.name}
                        emoji={rally.emoji}
                        isFavorite={rally.isFavorite}
                        stampDates={datesByRally.get(rally.id) ?? []}
                        stampCount={summary?.countsByRally.get(rally.id) ?? 0}
                        width={tileWidth}
                        // Archived rallies are looked back on, not stamped.
                        onPressStamp={
                          rally.isArchived
                            ? undefined
                            : () =>
                                saveStamp(
                                  { rallyId: rally.id },
                                  {
                                    onSuccess: (stamp) =>
                                      showAddMemoToast(stamp.id),
                                  },
                                )
                        }
                      />
                    ))}
                  </View>
                ) : null}
              </ScrollView>
            );
          }}
        />
      </View>
    </>
  );
}
