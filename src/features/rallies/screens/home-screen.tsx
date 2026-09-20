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
    Alert.alert("ラリーを削除しますか？", "この操作は取り消せません。", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: () => remove.mutate(rally.id),
      },
    ]);

  return (
    <TabRootScreen
      floatingAction={
        <Link href="/create-rally" asChild>
          <Pressable
            accessibilityLabel="ラリーを作る"
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
              読み込めませんでした
            </Text>
            <Pressable role="button" onPress={retryLists}>
              <Text className="text-main dark:text-slate-100">再試行</Text>
            </Pressable>
          </View>
        ) : null}
        {rallies.data?.length === 0 ? (
          <View className="items-center py-12">
            <Text>ラリーはまだありません</Text>
          </View>
        ) : null}
        {rallies.data?.map((rally) => (
          <RallyRow
            key={rally.id}
            name={rally.name}
            type={rally.type}
            stampDates={stampDatesForRally(stamps, rally.id)}
            onPressStamp={() =>
              pressStamp(
                { rallyId: rally.id },
                {
                  onSuccess: (stamp) => {
                    const toastId = toast("メモを追加しますか？", {
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
                        label: "メモを追加",
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
