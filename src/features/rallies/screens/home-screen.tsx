import { Alert, Pressable, Text, View } from "react-native";

import { Link } from "expo-router";

import {
  cancelLabel,
  deleteRallyConfirmMessage,
  deleteRallyConfirmTitle,
  deleteRallyLabel,
  formatStampDateTime,
  pressStampLabel,
  rallyTypeLabels,
  saveFailedMessage,
} from "../constants/rallies-constants";
import { useDeleteRally, useRallies } from "../hooks/use-rallies";
import { useSaveStamp, useStamps } from "../hooks/use-stamps";
import { type Rally } from "../schemas/rallies";

export function HomeScreen() {
  const { data: rallies } = useRallies();
  const {
    data: stamps,
    isError: isStampsError,
    error: stampsError,
  } = useStamps();
  const remove = useDeleteRally();
  const {
    mutate: pressStamp,
    isError: isSaveError,
    error: saveError,
  } = useSaveStamp();
  const errorDetail =
    saveError instanceof Error
      ? saveError.message
      : stampsError instanceof Error
        ? stampsError.message
        : null;
  const hasSaveError = isSaveError || isStampsError;

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
      {hasSaveError ? (
        <Text selectable className="text-[#ff3b30]">
          {saveFailedMessage}
          {errorDetail ? `\n${errorDetail}` : ""}
        </Text>
      ) : null}
      {rallies?.map((rally) => (
        <View key={rally.id} className="items-center gap-1">
          <Text selectable>{rally.name}</Text>
          <Text>{rallyTypeLabels[rally.type]}</Text>
          <Pressable
            role="button"
            aria-label={`${rally.name}に${pressStampLabel}`}
            onPress={() => {
              console.warn("[stamps] press", rally.id);
              pressStamp(
                { rallyId: rally.id },
                {
                  onError: (error) => {
                    Alert.alert(
                      saveFailedMessage,
                      error instanceof Error ? error.message : String(error),
                    );
                  },
                },
              );
            }}
          >
            <Text>{pressStampLabel}</Text>
          </Pressable>
          {stamps
            ?.filter((stamp) => stamp.rallyId === rally.id)
            .map((stamp) => (
              <Text key={stamp.id}>{formatStampDateTime(stamp.stampedAt)}</Text>
            ))}
          <Pressable
            role="button"
            aria-label={`${rally.name}を${deleteRallyLabel}`}
            onPress={() => confirmDelete(rally)}
          >
            <Text className="text-red-500">{deleteRallyLabel}</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}
