import { Alert, Text, View } from "react-native";

import { useRouter } from "expo-router";

import { Button } from "@/shared/components/button";
import { FormSheetContainer } from "@/shared/components/form-sheet";
import { formatStampTime } from "@/shared/utils/format-stamp-date-time";
import { localDateKey } from "@/shared/utils/local-date-key";

import { StampPost } from "../components/stamp-post";
import { useRallies } from "../hooks/use-rallies";
import { useDeleteStamp, useRallyStamps } from "../hooks/use-stamps";
import { type Rally } from "../schemas/rallies";
import { type Stamp } from "../schemas/stamps";

const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

type RallyDayScreenProps = {
  rallyId: Rally["id"];
  // Local midnight of the day to show.
  date: Date;
};

export function RallyDayScreen({ rallyId, date }: RallyDayScreenProps) {
  const { push } = useRouter();
  const { data: rallies } = useRallies();
  const { data: rallyStamps } = useRallyStamps(rallyId);
  const { mutate: deleteStamp } = useDeleteStamp();

  const rally = rallies?.find((candidate) => candidate.id === rallyId);
  const dayKey = localDateKey(date);
  const dayStamps = (rallyStamps ?? []).filter(
    (stamp) => localDateKey(new Date(stamp.stampedAt)) === dayKey,
  );

  const confirmDeleteStamp = (stampId: Stamp["id"]) =>
    Alert.alert("Delete stamp?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteStamp(stampId),
      },
    ]);

  return (
    <FormSheetContainer testID="rally-day-sheet" className="gap-5">
      <View className="gap-1">
        <Text className="text-foreground-secondary text-sm font-semibold">
          {weekdayFormatter.format(date)}
        </Text>
        <Text role="heading" className="text-foreground text-2xl font-bold">
          {dateFormatter.format(date)}
        </Text>
      </View>
      {rally && rallyStamps && dayStamps.length === 0 ? (
        // A day with a stamp gets no add button: the same rally cannot hold
        // two past stamps on one local day.
        <View className="gap-5">
          <View className="bg-surface-muted border-continuous items-center gap-2 rounded-3xl py-8">
            <Text aria-hidden className="text-3xl opacity-60">
              {rally.emoji}
            </Text>
            <Text className="text-foreground-secondary text-base">
              No stamp on this day
            </Text>
          </View>
          <Button
            label="Stamp this day"
            onPress={() =>
              push({
                pathname: "/add-past-stamp",
                params: { rallyId, date: dayKey },
              })
            }
          />
        </View>
      ) : null}
      {rally
        ? dayStamps.map((stamp) => (
            <StampPost
              key={stamp.id}
              id={stamp.id}
              emoji={rally.emoji}
              title={formatStampTime(new Date(stamp.stampedAt))}
              memo={stamp.memo}
              onEdit={(stampId) =>
                push({ pathname: "/edit-stamp", params: { stampId } })
              }
              onDelete={confirmDeleteStamp}
            />
          ))
        : null}
    </FormSheetContainer>
  );
}
