import { Pressable, Text, View } from "react-native";

import { Link, useRouter } from "expo-router";

import { Plus } from "@/shared/components/icons";
import { TabRootScreen } from "@/shared/components/tab-root-screen";

import { CollectionSummary } from "../components/collection-summary";
import { RallyRow } from "../components/rally-row";
import { showAddMemoToast } from "../components/show-add-memo-toast";
import { useRallies } from "../hooks/use-rallies";
import { useSaveStamp, useStamps } from "../hooks/use-stamps";
import { type Stamp } from "../schemas/stamps";

function stampDatesForRally(stamps: Stamp[], rallyId: number) {
  return stamps
    .filter((stamp) => stamp.rallyId === rallyId)
    .map((stamp) => stamp.stampedAt);
}

export function HomeScreen() {
  const { push } = useRouter();
  const rallies = useRallies();
  const stampsQuery = useStamps();
  const stamps: Stamp[] = stampsQuery.data ?? [];
  const { mutate: pressStamp } = useSaveStamp();
  const isListError = rallies.isError || stampsQuery.isError;

  const retryLists = () => {
    void rallies.refetch();
    void stampsQuery.refetch();
  };

  return (
    <TabRootScreen
      floatingAction={
        <Link href="/create-rally" asChild>
          <Pressable
            accessibilityLabel="Create rally"
            className="bg-inverse active:bg-main-hover shadow-fab absolute right-5 bottom-24 size-14 items-center justify-center rounded-full"
          >
            <Plus colorClassName="accent-white" size={24} strokeWidth={2.5} />
          </Pressable>
        </Link>
      }
    >
      <View className="w-full">
        {rallies.data && stampsQuery.data ? (
          <CollectionSummary rallies={rallies.data} stamps={stampsQuery.data} />
        ) : null}
        {isListError ? (
          <View className="items-center gap-2 py-12">
            <Text selectable className="text-danger">
              Couldn't load
            </Text>
            <Pressable role="button" onPress={retryLists}>
              <Text className="text-foreground">Retry</Text>
            </Pressable>
          </View>
        ) : null}
        {rallies.data?.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-foreground-secondary">No rallies yet</Text>
          </View>
        ) : null}
        {rallies.data?.length ? (
          <View className="mt-2 mb-1 flex-row items-center justify-between">
            <Text
              role="heading"
              className="text-foreground text-lg font-semibold"
            >
              Your Days
            </Text>
            <Link href="/rallies-list" asChild>
              <Pressable accessibilityRole="link">
                <Text className="text-foreground text-sm">View All</Text>
              </Pressable>
            </Link>
          </View>
        ) : null}
        {rallies.data?.map((rally) => (
          <RallyRow
            key={rally.id}
            name={rally.name}
            emoji={rally.emoji}
            stampDates={stampDatesForRally(stamps, rally.id)}
            onPressStamp={() =>
              pressStamp(
                { rallyId: rally.id },
                { onSuccess: (stamp) => showAddMemoToast(stamp.id) },
              )
            }
            onPressDetail={() =>
              push({ pathname: "/rallies/[id]", params: { id: rally.id } })
            }
          />
        ))}
      </View>
    </TabRootScreen>
  );
}
