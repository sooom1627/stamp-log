import { Alert, Pressable, Text, View } from "react-native";

import { Link, useRouter } from "expo-router";

import { toast } from "sonner-native";

import { formatDateTime } from "@/shared/utils/format-date-time";

import { RallyRow } from "../components/rally-row";
import { useDeleteRally, useRallies } from "../hooks/use-rallies";
import { useSaveStamp, useStamps } from "../hooks/use-stamps";
import { rallyTypeLabels, type Rally } from "../schemas/rallies";
import { type Stamp } from "../schemas/stamps";

function stampLabelsForRally(stamps: Stamp[], rallyId: number) {
  return stamps
    .filter((stamp) => stamp.rallyId === rallyId)
    .map((stamp) => ({
      id: stamp.id,
      label: formatDateTime(stamp.stampedAt),
      memo: stamp.memo,
    }));
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
    <View className="flex-1 items-center justify-center gap-4">
      <Link href="/create-rally">ラリーを作る</Link>
      {isListError ? (
        <View className="items-center gap-2">
          <Text selectable className="text-[#ff3b30]">
            読み込めませんでした
          </Text>
          <Pressable role="button" onPress={retryLists}>
            <Text>再試行</Text>
          </Pressable>
        </View>
      ) : null}
      {rallies.data?.map((rally) => (
        <RallyRow
          key={rally.id}
          name={rally.name}
          typeLabel={rallyTypeLabels[rally.type]}
          stampLabels={stampLabelsForRally(stamps, rally.id)}
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
  );
}
