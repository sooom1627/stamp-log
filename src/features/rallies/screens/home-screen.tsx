import { Alert, Text, View } from "react-native";

import { Link } from "expo-router";

import { formatDateTime } from "@/shared/utils/format-date-time";

import { RallyRow } from "../components/rally-row";
import {
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

export function HomeScreen() {
  const { data: rallies } = useRallies();
  const { data: stamps, isError: isStampsError } = useStamps();
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
          stampLabels={
            stamps
              ?.filter((stamp) => stamp.rallyId === rally.id)
              .map((stamp) => ({
                id: stamp.id,
                label: formatDateTime(stamp.stampedAt),
              })) ?? []
          }
          onPressStamp={() => pressStamp({ rallyId: rally.id })}
          onDelete={() => confirmDelete(rally)}
        />
      ))}
    </View>
  );
}
