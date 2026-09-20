import { Alert, Pressable, Text, View } from "react-native";

import { Link, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";

import { toast } from "sonner-native";

import { TabRootScreen } from "@/shared/components/tab-root-screen";

import { CollectionSummary } from "../components/collection-summary";
import { RallyRow } from "../components/rally-row";
import { useDeleteRally, useRallies } from "../hooks/use-rallies";
import { useSaveStamp, useStamps } from "../hooks/use-stamps";
import { type Rally } from "../schemas/rallies";
import { type Stamp } from "../schemas/stamps";

function stampDatesForRally(stamps: Stamp[], rallyId: number) {
  return stamps
    .filter((stamp) => stamp.rallyId === rallyId)
    .map((stamp) => stamp.stampedAt);
}

export function HomeScreen() {
  const router = useRouter();
  const rallies = useRallies();
  const stampsQuery = useStamps();
  const stamps: Stamp[] = stampsQuery.data ?? [];
  const remove = useDeleteRally();
  const { mutate: pressStamp } = useSaveStamp();
  const isListError = rallies.isError || stampsQuery.isError;

  const retryLists = () => {
    void rallies.refetch();
    void stampsQuery.refetch();
  };

  const confirmDelete = (rally: Rally) =>
    Alert.alert("Delete rally?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => remove.mutate(rally.id),
      },
    ]);

  return (
    <TabRootScreen
      floatingAction={
        <Link href="/create-rally" asChild>
          <Pressable
            accessibilityLabel="Create rally"
            className="bg-main active:bg-main-hover dark:bg-main-hover absolute right-5 bottom-24 size-14 items-center justify-center rounded-full"
            style={{ boxShadow: "0 8px 24px rgba(30, 41, 59, 0.22)" }}
          >
            <SymbolView
              name={{ ios: "plus", android: "add", web: "add" }}
              size={24}
              tintColor="#ffffff"
            />
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
              <Text className="text-main dark:text-slate-100">Retry</Text>
            </Pressable>
          </View>
        ) : null}
        {rallies.data?.length === 0 ? (
          <View className="items-center py-12">
            <Text>No rallies yet</Text>
          </View>
        ) : null}
        {rallies.data?.length ? (
          <View className="mt-2 mb-1 flex-row items-center justify-between">
            <Text
              role="heading"
              className="text-main text-lg font-semibold dark:text-slate-100"
            >
              Your Days
            </Text>
            <Link href="/rallies-list" asChild>
              <Pressable accessibilityRole="link">
                <Text className="text-main text-sm dark:text-slate-100">
                  View All
                </Text>
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
                {
                  onSuccess: (stamp) => {
                    const toastId = toast("Add a memo?", {
                      duration: 5000,
                      styles: {
                        textContainer: {
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                        },
                        buttons: {
                          marginTop: 0,
                          marginLeft: "auto",
                        },
                      },
                      action: {
                        label: "Add memo",
                        onClick: () => {
                          toast.dismiss(toastId);
                          router.push(`/add-stamp-memo?stampId=${stamp.id}`);
                        },
                      },
                    });
                  },
                },
              )
            }
            onDelete={() => confirmDelete(rally)}
          />
        ))}
      </View>
    </TabRootScreen>
  );
}
