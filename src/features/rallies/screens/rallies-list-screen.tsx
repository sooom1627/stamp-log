import { useCallback, useState } from "react";

import { ScrollView, Text, useWindowDimensions, View } from "react-native";

import { Stack, useFocusEffect, useRouter } from "expo-router";
import { Button, Host, Picker, Text as SwiftText } from "@expo/ui/swift-ui";
import { pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";

import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { LoadError } from "@/shared/components/load-error";

import { RallyTile } from "../components/rally-tile";
import { showAddMemoToast } from "../components/show-add-memo-toast";
import { useRallies } from "../hooks/use-rallies";
import { useSaveStamp, useStamps } from "../hooks/use-stamps";
import { type Rally } from "../schemas/rallies";
import { type Stamp } from "../schemas/stamps";
import { sortRalliesForHome } from "../utils/sort-rallies-for-home";

// A swipe shorter than this stays on the tab.
const SWIPE_DISTANCE = 60;

// Matches the screen's px-5 and the grid's gap-2.5.
const SCREEN_PADDING = 20;
const TILE_GAP = 10;

type RalliesFilter = "all" | "favorites" | "archived";

const filters: { value: RalliesFilter; label: string; empty: string }[] = [
  { value: "all", label: "All", empty: "No rallies" },
  { value: "favorites", label: "Favorites", empty: "No favorites yet" },
  { value: "archived", label: "Archived", empty: "No archived rallies" },
];

function isInFilter(rally: Rally, filter: RalliesFilter) {
  if (filter === "archived") return rally.isArchived;
  if (rally.isArchived) return false;
  return filter === "favorites" ? rally.isFavorite : true;
}

function stampDatesForRally(stamps: Stamp[], rallyId: number) {
  return stamps
    .filter((stamp) => stamp.rallyId === rallyId)
    .map((stamp) => stamp.stampedAt);
}

export function RalliesListScreen() {
  const { push } = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const tileWidth = (windowWidth - SCREEN_PADDING * 2 - TILE_GAP) / 2;
  const [filter, setFilter] = useState<RalliesFilter>("all");
  const {
    data: rallies,
    isError: isRalliesError,
    refetch: refetchRallies,
  } = useRallies();
  const {
    data: stamps,
    isError: isStampsError,
    refetch: refetchStamps,
  } = useStamps();
  const { mutate: saveStamp } = useSaveStamp();

  // Same as home: the order is fixed while the list is open, so a tile does
  // not jump away while it is being stamped.
  const [orderStamps, setOrderStamps] = useState<Stamp[] | null>(null);
  const [shouldResort, setShouldResort] = useState(true);
  useFocusEffect(useCallback(() => setShouldResort(true), []));
  if (shouldResort && stamps) {
    setShouldResort(false);
    setOrderStamps(stamps);
  }
  const shownRallies = rallies
    ? sortRalliesForHome(
        rallies.filter((rally) => isInFilter(rally, filter)),
        orderStamps ?? stamps ?? [],
      )
    : undefined;
  const emptyText = filters.find(({ value }) => value === filter)?.empty;
  const openCreateRally = () => push("/create-rally");

  // Left goes to the next tab, right to the previous one; the ends stay put.
  // It starts only on a sideways move, so vertical scrolling is untouched.
  const swipeTabs = Gesture.Pan()
    .withTestId("rallies-list-swipe")
    .activeOffsetX([-20, 20])
    .failOffsetY([-15, 15])
    .runOnJS(true)
    .onEnd(({ translationX }) => {
      if (Math.abs(translationX) < SWIPE_DISTANCE) return;
      const index = filters.findIndex(({ value }) => value === filter);
      const next = filters[index + (translationX < 0 ? 1 : -1)];
      if (next) setFilter(next.value);
    });

  const retryLists = () => {
    void refetchRallies();
    void refetchStamps();
  };

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel="Create rally"
          icon="plus"
          onPress={openCreateRally}
        />
      </Stack.Toolbar>
      <GestureDetector gesture={swipeTabs}>
        <ScrollView
          aria-label="Rallies list"
          className="bg-canvas flex-1"
          contentContainerClassName="gap-4 px-5 pt-2 pb-32"
          contentInsetAdjustmentBehavior="automatic"
        >
          {/* The native toolbar button is not in the RN tree; tests press this. */}
          {process.env.NODE_ENV === "test" ? (
            <Host matchContents>
              <Button
                testID="rallies-list-create"
                label="Create rally"
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
                  {label}
                </SwiftText>
              ))}
            </Picker>
          </Host>
          {isRalliesError || isStampsError ? (
            <LoadError onRetry={retryLists} />
          ) : null}
          {shownRallies?.length === 0 ? (
            <Text className="text-foreground-muted py-12 text-center text-sm">
              {emptyText}
            </Text>
          ) : null}
          {shownRallies?.length ? (
            <View className="flex-row flex-wrap gap-2.5" testID="rally-grid">
              {shownRallies.map((rally) => (
                <RallyTile
                  key={rally.id}
                  name={rally.name}
                  emoji={rally.emoji}
                  isFavorite={rally.isFavorite}
                  stampDates={stampDatesForRally(stamps ?? [], rally.id)}
                  width={tileWidth}
                  // Archived rallies are looked back on, not stamped.
                  onPressStamp={
                    rally.isArchived
                      ? undefined
                      : () =>
                          saveStamp(
                            { rallyId: rally.id },
                            {
                              onSuccess: (stamp) => showAddMemoToast(stamp.id),
                            },
                          )
                  }
                  onPressDetail={() =>
                    push({
                      pathname: "/rallies/[id]",
                      params: { id: rally.id },
                    })
                  }
                />
              ))}
            </View>
          ) : null}
        </ScrollView>
      </GestureDetector>
    </>
  );
}
