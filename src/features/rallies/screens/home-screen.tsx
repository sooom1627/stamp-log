import { Alert, Text, View } from "react-native";

import { Link, useRouter } from "expo-router";

import { toast } from "sonner-native";

import { formatDateTime } from "@/shared/utils/format-date-time";

import { RallyRow } from "../components/rally-row";
import {
  addMemoActionLabel,
  addMemoPrompt,
  cancelLabel,
  deleteRallyConfirmMessage,
  deleteRallyConfirmTitle,
  deleteRallyLabel,
  rallyTypeLabels,
  saveFailedMessage,
} from "../constants/rallies-constants";
import { useDeleteRally, useRallies } from "../hooks/use-rallies";
import { useSaveStamp, useStamps } from "../hooks/use-stamps";
import { type Rally } from "../schemas/rallies";
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
  const { data: rallies } = useRallies();
  const { data, isError: isStampsError } = useStamps();
  const stamps: Stamp[] = data ?? [];
  const remove = useDeleteRally();
  const { mutate: pressStamp, isError: isSaveError } = useSaveStamp();

  const confirmDelete = (rally: Rally) =>
    Alert.alert(deleteRallyConfirmTitle, deleteRallyConfirmMessage, [
      { text: cancelLabel, style: "cancel" },
      {
        text: deleteRallyLabel,
        style: "destructive",
        onPress: () => remove.mutate(rally.id),
      },
    ]);

  return (
    <View className="flex-1 items-center justify-center gap-4">
      <Link href="/create-rally">ラリーを作る</Link>
      {isSaveError || isStampsError ? (
        <Text selectable className="text-[#ff3b30]">
          {saveFailedMessage}
        </Text>
      ) : null}
      {rallies?.map((rally) => (
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
                  const toastId = toast(addMemoPrompt, {
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
                      label: addMemoActionLabel,
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
