import { useState } from "react";

import { Alert, FlatList, Text, View } from "react-native";

import { Stack, useRouter } from "expo-router";

import { GestureDetector } from "react-native-gesture-handler";

import { LoadError } from "@/shared/components/load-error";
import { formatStampCount } from "@/shared/utils/format-stamp-count";
import { formatStampTime } from "@/shared/utils/format-stamp-date-time";
import { groupByLocalDay } from "@/shared/utils/group-by-local-day";
import { swipeBetween } from "@/shared/utils/swipe-between";

import { AlbumRow, albumRows } from "../components/album-row";
import { DayCard } from "../components/day-card";
import { RallyActionsMenu } from "../components/rally-actions-menu";
import { RallyMonthCalendar } from "../components/rally-month-calendar";
import { RallySummaryStats } from "../components/rally-summary-stats";
import { StampPost } from "../components/stamp-post";
import {
  StampsAlbumPicker,
  stampsViews,
  type StampsView,
} from "../components/stamps-album-picker";
import { useCloseWhenMissing } from "../hooks/use-close-when-missing";
import {
  useDeleteRally,
  useRally,
  useSetRallyArchived,
  useSetRallyFavorite,
} from "../hooks/use-rallies";
import { useRallyStamps } from "../hooks/use-stamps";
import { type Rally } from "../schemas/rallies";
import { albumTiles, type AlbumTile } from "../utils/album-photos";
import { buildRallySummary } from "../utils/rally-summary";

// The edge where a sideways swipe stays the iOS back gesture, not the switch.
const BACK_SWIPE_EDGE = 30;

type TimelineEmptyProps = {
  isError: boolean;
  isLoaded: boolean;
  message: string;
  onRetry: () => void;
};

function TimelineEmpty({
  isError,
  isLoaded,
  message,
  onRetry,
}: TimelineEmptyProps) {
  if (isError) return <LoadError onRetry={onRetry} />;
  if (!isLoaded) return null;

  return (
    <View className="items-center py-12">
      <Text className="text-foreground-secondary">{message}</Text>
    </View>
  );
}

// Stamps that could not be loaded are still deleted with the rally, so the
// message says so without a count.
function deleteRallyMessage(stampCount: number | undefined) {
  const undoNote = "This action cannot be undone.";
  if (stampCount === 0) {
    return undoNote;
  }
  if (stampCount === undefined) {
    return `Its stamps will also be deleted. ${undoNote}`;
  }
  return `Its ${formatStampCount(stampCount)} will also be deleted. ${undoNote}`;
}

type RallyDetailScreenProps = {
  rallyId: Rally["id"];
};

export function RallyDetailScreen({ rallyId }: RallyDetailScreenProps) {
  const { back, push } = useRouter();
  // Starts on Stamps every time the screen opens (not remembered).
  const [view, setView] = useState<StampsView>("stamps");
  const { data: rally } = useRally(rallyId);
  const {
    data: stamps,
    isError: isStampsError,
    isSuccess: isStampsLoaded,
    refetch: refetchStamps,
  } = useRallyStamps(rallyId);
  const { mutate: deleteRally } = useDeleteRally();
  const { mutate: setRallyFavorite } = useSetRallyFavorite();
  const { mutate: setRallyArchived } = useSetRallyArchived();
  const summary = stamps
    ? buildRallySummary(
        stamps.map((stamp) => stamp.stampedAt),
        new Date(),
      )
    : null;
  const sections = groupByLocalDay(stamps ?? [], (stamp) => stamp.stampedAt);

  useCloseWhenMissing(rally === null);

  if (!rally) {
    return null;
  }

  const tiles = albumTiles(stamps ?? [], [rally]);
  const photoCount = tiles.reduce((sum, tile) => sum + tile.photoCount, 0);
  const isAlbum = view === "album";
  const swipeViews = swipeBetween({
    testId: "rally-view-swipe",
    values: stampsViews,
    value: view,
    onChange: setView,
    isEnabled: (stamps?.length ?? 0) > 0,
    leftEdge: BACK_SWIPE_EDGE,
  });
  // One list for both views, so the calendar above keeps its state.
  const items: (
    | { kind: "row"; key: string; row: AlbumTile[] }
    | { kind: "day"; key: string; section: (typeof sections)[number] }
  )[] = isAlbum
    ? albumRows(tiles).map((row) => ({
        kind: "row",
        key: `row-${row[0].key}`,
        row,
      }))
    : sections.map((section) => ({
        kind: "day",
        key: section.dateKey,
        section,
      }));

  const confirmDelete = () =>
    Alert.alert("Delete rally?", deleteRallyMessage(stamps?.length), [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteRally(rally.id, { onSuccess: back }),
      },
    ]);

  return (
    <>
      <GestureDetector gesture={swipeViews}>
        <FlatList
          aria-label="Rally detail"
          className="bg-canvas flex-1"
          contentContainerClassName={
            isAlbum ? "gap-0.5 px-5 py-6" : "gap-6 px-5 py-6"
          }
          contentInsetAdjustmentBehavior="automatic"
          data={items}
          keyExtractor={({ key }) => key}
          renderItem={({ item }) => {
            // One rally's photos, so the tiles need no emoji.
            if (item.kind === "row") {
              return <AlbumRow tiles={item.row} showsEmoji={false} />;
            }
            const { dateKey, data } = item.section;
            return (
              <DayCard dateKey={dateKey} date={new Date(data[0].stampedAt)}>
                {data.map((stamp) => (
                  <StampPost
                    key={stamp.id}
                    stamp={stamp}
                    emoji={rally.emoji}
                    title={formatStampTime(new Date(stamp.stampedAt))}
                  />
                ))}
              </DayCard>
            );
          }}
          ListHeaderComponent={
            <View
              className={
                isAlbum ? "items-center gap-4 pb-6" : "items-center gap-4"
              }
            >
              <View
                testID="rally-top-panel"
                className="bg-accent-subtle border-continuous w-full items-center gap-2 rounded-3xl px-5 pt-6 pb-5"
              >
                <View className="bg-background size-20 items-center justify-center rounded-full">
                  <Text className="text-5xl">{rally.emoji}</Text>
                </View>
                <Text
                  selectable
                  role="heading"
                  className="text-foreground mt-1 text-2xl font-bold"
                >
                  {rally.name}
                </Text>
                {rally.isArchived ? (
                  <Text className="text-foreground-muted text-sm font-medium">
                    Archived
                  </Text>
                ) : null}
                {stamps ? (
                  <Text className="text-accent-strong text-base font-semibold">
                    {formatStampCount(stamps.length)}
                  </Text>
                ) : null}
                {stamps ? <RallySummaryStats summary={summary} /> : null}
              </View>
              <RallyMonthCalendar
                stampDates={stamps?.map((stamp) => stamp.stampedAt) ?? []}
                emoji={rally.emoji}
                onPressDay={(date) =>
                  push({
                    pathname: "/rally-day",
                    params: { rallyId: rally.id, date },
                  })
                }
              />
              {stamps && stamps.length > 0 ? (
                <View className="w-full pt-4">
                  <StampsAlbumPicker
                    testID="rally-view-picker"
                    view={view}
                    stampCount={stamps.length}
                    photoCount={photoCount}
                    onChangeView={setView}
                  />
                </View>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <TimelineEmpty
              isError={isStampsError}
              isLoaded={isStampsLoaded}
              message={isAlbum ? "No photos yet" : "No stamps yet"}
              onRetry={() => void refetchStamps()}
            />
          }
        />
      </GestureDetector>
      <Stack.Title>{rally.name}</Stack.Title>
      <RallyActionsMenu
        isFavorite={rally.isFavorite}
        isArchived={rally.isArchived}
        onToggleFavorite={() =>
          setRallyFavorite({ id: rally.id, isFavorite: !rally.isFavorite })
        }
        onToggleArchive={() =>
          setRallyArchived({ id: rally.id, isArchived: !rally.isArchived })
        }
        onPastStamp={() =>
          push({ pathname: "/add-past-stamp", params: { rallyId: rally.id } })
        }
        onEdit={() =>
          push({ pathname: "/edit-rally", params: { rallyId: rally.id } })
        }
        onDelete={confirmDelete}
      />
    </>
  );
}
