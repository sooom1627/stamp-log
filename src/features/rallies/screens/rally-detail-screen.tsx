import { useState } from "react";

import { Alert, ScrollView, Text, View } from "react-native";

import { Stack, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";

import { TimelineEmpty } from "@/shared/components/timeline-empty";
import { formatStampCount } from "@/shared/utils/format-stamp-count";
import { formatStampTime } from "@/shared/utils/format-stamp-date-time";
import { groupByLocalDay } from "@/shared/utils/group-by-local-day";

import { DayCard } from "../components/day-card";
import { RallyActionsMenu } from "../components/rally-actions-menu";
import { RallyMonthCalendar } from "../components/rally-month-calendar";
import { RallySummaryStats } from "../components/rally-summary-stats";
import { StampPost } from "../components/stamp-post";
import { StampsAlbumPager } from "../components/stamps-album-pager";
import {
  StampsAlbumPicker,
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
import { albumTiles } from "../utils/album-photos";
import { buildRallySummary } from "../utils/rally-summary";

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
  const headerHeight = useHeaderHeight();
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
  const stampDates = stamps?.map((stamp) => stamp.stampedAt) ?? [];
  const summary = stamps ? buildRallySummary(stampDates, new Date()) : null;
  const sections = groupByLocalDay(stamps ?? [], (stamp) => stamp.stampedAt);

  useCloseWhenMissing(rally === null);

  if (!rally) {
    return null;
  }

  const hasStamps = stamps !== undefined && stamps.length > 0;
  const tiles = albumTiles(stamps ?? [], [rally]);
  const photoCount = tiles.reduce((sum, tile) => sum + tile.photoCount, 0);
  const confirmDelete = () =>
    Alert.alert("Delete rally?", deleteRallyMessage(stamps?.length), [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteRally(rally.id, { onSuccess: () => back() }),
      },
    ]);

  return (
    <>
      {/* The header is transparent, so the scroll starts below it. */}
      <View className="bg-canvas flex-1" style={{ paddingTop: headerHeight }}>
        {/* Like a profile: the top scrolls away and the switch sticks, while
            the pages below still follow the finger (S-043 T-003). */}
        <ScrollView
          aria-label="Rally detail"
          className="bg-canvas flex-1"
          contentContainerClassName="pb-6"
          stickyHeaderIndices={hasStamps ? [1] : undefined}
        >
          <View className="items-center gap-4 px-5 pt-6">
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
              stampDates={stampDates}
              emoji={rally.emoji}
              onPressDay={(date) =>
                push({
                  pathname: "/rally-day",
                  params: { rallyId: rally.id, date },
                })
              }
            />
          </View>
          {hasStamps ? (
            <View className="bg-canvas px-5 pt-4 pb-2">
              <StampsAlbumPicker
                testID="rally-view-picker"
                view={view}
                stampCount={stamps.length}
                photoCount={photoCount}
                onChangeView={setView}
              />
            </View>
          ) : null}
          {hasStamps ? (
            <StampsAlbumPager
              testIDPrefix="rally-view"
              view={view}
              onChangeView={setView}
              pageClassName="px-5 pt-4"
              stamps={
                <View className="gap-6">
                  {sections.map(({ dateKey, data }) => (
                    <DayCard
                      key={dateKey}
                      dateKey={dateKey}
                      date={new Date(data[0].stampedAt)}
                    >
                      {data.map((stamp) => (
                        <StampPost
                          key={stamp.id}
                          stamp={stamp}
                          emoji={rally.emoji}
                          title={formatStampTime(new Date(stamp.stampedAt))}
                        />
                      ))}
                    </DayCard>
                  ))}
                </View>
              }
              tiles={tiles}
              // One rally's photos, so the tiles need no emoji.
              showsEmoji={false}
            />
          ) : (
            <TimelineEmpty
              isError={isStampsError}
              isLoaded={isStampsLoaded}
              message="No stamps yet"
              onRetry={() => void refetchStamps()}
            />
          )}
        </ScrollView>
      </View>
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
