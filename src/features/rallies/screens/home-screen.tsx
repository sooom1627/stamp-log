import { Pressable, Text, useWindowDimensions, View } from "react-native";

import { Link, useRouter } from "expo-router";

import { Plus } from "@/shared/components/icons";
import { LoadError } from "@/shared/components/load-error";
import { TabRootScreen } from "@/shared/components/tab-root-screen";

import { RallyTile } from "../components/rally-tile";
import { showAddMemoToast } from "../components/show-add-memo-toast";
import { TodayCard } from "../components/today-card";
import { useRallies } from "../hooks/use-rallies";
import { useSaveStamp, useStamps } from "../hooks/use-stamps";
import { type Stamp } from "../schemas/stamps";
import { buildTodayStampedRallies } from "../utils/today-stamped-rallies";

// Matches the tab root's px-5 and the grid's gap-2.5.
const SCREEN_PADDING = 20;
const TILE_GAP = 10;

function stampDatesForRally(stamps: Stamp[], rallyId: number) {
  return stamps
    .filter((stamp) => stamp.rallyId === rallyId)
    .map((stamp) => stamp.stampedAt);
}

export function HomeScreen() {
  const { push } = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const tileWidth = (windowWidth - SCREEN_PADDING * 2 - TILE_GAP) / 2;
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
  const isListError = isRalliesError || isStampsError;
  const today = new Date();

  const retryLists = () => {
    void refetchRallies();
    void refetchStamps();
  };

  return (
    <TabRootScreen>
      <View className="w-full">
        {rallies && stamps ? (
          <TodayCard
            rallies={buildTodayStampedRallies(stamps, rallies, today)}
            today={today}
          />
        ) : null}
        {isListError ? <LoadError onRetry={retryLists} /> : null}
        {rallies?.length ? (
          <View className="mt-2 mb-2.5 flex-row items-center justify-between">
            <Text role="heading" className="text-foreground text-xl font-bold">
              Your Days
            </Text>
            <Link href="/rallies-list" asChild>
              <Pressable role="link">
                <Text className="text-foreground text-sm">View All</Text>
              </Pressable>
            </Link>
          </View>
        ) : null}
        {rallies ? (
          <View className="flex-row flex-wrap gap-2.5" testID="rally-grid">
            {rallies.map((rally) => (
              <RallyTile
                key={rally.id}
                name={rally.name}
                emoji={rally.emoji}
                stampDates={stampDatesForRally(stamps ?? [], rally.id)}
                width={tileWidth}
                onPressStamp={() =>
                  saveStamp(
                    { rallyId: rally.id },
                    { onSuccess: (stamp) => showAddMemoToast(stamp.id) },
                  )
                }
                onPressDetail={() =>
                  push({ pathname: "/rallies/[id]", params: { id: rally.id } })
                }
              />
            ))}
            <Link href="/create-rally" asChild>
              <Pressable
                aria-label="Create rally"
                className="border-border border-continuous min-h-44 items-center justify-center gap-2 rounded-3xl border-2 border-dashed active:opacity-70"
                style={{ width: tileWidth }}
              >
                <View className="bg-surface-muted size-11 items-center justify-center rounded-full">
                  <Plus
                    colorClassName="accent-foreground"
                    size={20}
                    strokeWidth={2.5}
                  />
                </View>
                <Text className="text-foreground text-sm font-semibold">
                  New rally
                </Text>
              </Pressable>
            </Link>
          </View>
        ) : null}
      </View>
    </TabRootScreen>
  );
}
