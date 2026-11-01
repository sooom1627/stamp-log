import { useCallback, useState } from "react";

import { Pressable, Text, useWindowDimensions, View } from "react-native";

import { Link, useFocusEffect } from "expo-router";

import { useTranslation } from "react-i18next";

import { Plus } from "@/shared/components/icons";
import { LoadError } from "@/shared/components/load-error";
import { TabRootScreen } from "@/shared/components/tab-root-screen";
import { useRalliesAndStamps } from "@/shared/hooks/use-rallies-and-stamps";
import {
  useFirstStampedAt,
  useSaveStamp,
  useStampSummary,
} from "@/shared/hooks/use-stamps";
import { useToday } from "@/shared/hooks/use-today";
import { type Rally } from "@/shared/schemas/rallies";

import { HomeTopCards } from "../components/home-top-cards";
import { RallyTile } from "../components/rally-tile";
import { showAddMemoToast } from "../components/show-add-memo-toast";
import { sortRalliesForHome } from "../utils/sort-rallies-for-home";
import { stampDatesByRally } from "../utils/stamp-dates-by-rally";
import { buildTodayLog, countDaysWithAto } from "../utils/today-log";
import { buildTodayStampedRallies } from "../utils/today-stamped-rallies";

// Matches the tab root's px-5 and the grid's gap-2.5.
const SCREEN_PADDING = 20;
const TILE_GAP = 10;

export function HomeScreen() {
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const tileWidth = (windowWidth - SCREEN_PADDING * 2 - TILE_GAP) / 2;
  const today = useToday();
  const {
    rallies,
    stamps: summary,
    isError: isListError,
    retry: retryLists,
  } = useRalliesAndStamps(useStampSummary(today));
  const { data: firstStampedAt } = useFirstStampedAt();
  const { mutate: saveStamp } = useSaveStamp();

  // Tiles are ordered by the counts seen when home came into focus, so a
  // tile does not jump away while it is being stamped.
  const [orderCounts, setOrderCounts] = useState<ReadonlyMap<
    Rally["id"],
    number
  > | null>(null);
  const [shouldResort, setShouldResort] = useState(true);
  // Rallies stamped from the tiles since home came into focus. Only their
  // emojis are pressed into today's stamp (S-056); ones already there when
  // home opens or comes back stay still.
  const [pressedRallyIds, setPressedRallyIds] = useState<
    ReadonlySet<Rally["id"]>
  >(new Set());
  useFocusEffect(
    useCallback(() => {
      setShouldResort(true);
      setPressedRallyIds(new Set());
    }, []),
  );
  if (shouldResort && summary) {
    setShouldResort(false);
    setOrderCounts(summary.countsByRally);
  }
  // Archived rallies leave the tiles but stay in the today card: it is a record.
  const orderedRallies = rallies
    ? sortRalliesForHome(
        rallies.filter((rally) => !rally.isArchived),
        orderCounts ?? summary?.countsByRally ?? new Map(),
      )
    : undefined;
  const datesByRally = stampDatesByRally(summary?.recentStamps ?? []);
  // With Ato shows every rally made: home's tiles first, then archived ones.
  const allRallies =
    rallies && orderedRallies
      ? [...orderedRallies, ...rallies.filter((rally) => rally.isArchived)]
      : [];

  return (
    <TabRootScreen label={t("tabs.home")}>
      <View className="w-full">
        {rallies && summary && firstStampedAt !== undefined ? (
          <HomeTopCards
            windowWidth={windowWidth}
            today={today}
            todayRallies={buildTodayStampedRallies(
              summary.recentStamps,
              rallies,
              today,
            )}
            pressedRallyIds={pressedRallyIds}
            todayLog={buildTodayLog(summary.recentStamps, rallies, today)}
            daysWithAto={countDaysWithAto(firstStampedAt, today)}
            firstStampedAt={firstStampedAt ? new Date(firstStampedAt) : null}
            stampCount={[...summary.countsByRally.values()].reduce(
              (total, count) => total + count,
              0,
            )}
            allRallies={allRallies}
          />
        ) : null}
        {isListError ? <LoadError onRetry={retryLists} /> : null}
        {rallies?.length ? (
          <View className="mt-2 mb-2.5 flex-row items-center justify-between">
            <Text role="heading" className="text-foreground text-xl font-bold">
              Your Days
            </Text>
            <Link href="/rallies-list" asChild>
              {/* 44pt tall; the negative margins keep the row and the text where they were. */}
              <Pressable
                role="link"
                className="-my-2 -mr-2 min-h-11 justify-center px-2 active:opacity-70"
              >
                <Text className="text-foreground text-base font-medium">
                  {t("home.viewAll")}
                </Text>
              </Pressable>
            </Link>
          </View>
        ) : null}
        {orderedRallies ? (
          <View className="flex-row flex-wrap gap-2.5" testID="rally-grid">
            {orderedRallies.map((rally) => (
              <RallyTile
                key={rally.id}
                rallyId={rally.id}
                name={rally.name}
                emoji={rally.emoji}
                isFavorite={rally.isFavorite}
                stampDates={datesByRally.get(rally.id) ?? []}
                stampCount={summary?.countsByRally.get(rally.id) ?? 0}
                width={tileWidth}
                onPressStamp={() => {
                  setPressedRallyIds(
                    (pressed) => new Set([...pressed, rally.id]),
                  );
                  saveStamp(
                    { rallyId: rally.id },
                    { onSuccess: (stamp) => showAddMemoToast(stamp.id) },
                  );
                }}
              />
            ))}
            <Link href="/create-rally" asChild>
              <Pressable
                aria-label={t("rallies.createRally")}
                className="border-border border-continuous min-h-44 items-center justify-center gap-2 rounded-3xl border-2 border-dashed active:opacity-70"
                style={{ width: tileWidth }}
              >
                <View
                  className="bg-surface size-11 items-center justify-center rounded-full"
                  testID="new-rally-icon"
                >
                  <Plus
                    colorClassName="accent-foreground"
                    size={20}
                    strokeWidth={2.5}
                  />
                </View>
                <Text className="text-foreground text-sm font-semibold">
                  {t("home.newRally")}
                </Text>
              </Pressable>
            </Link>
          </View>
        ) : null}
      </View>
    </TabRootScreen>
  );
}
