import { Text, View } from "react-native";

import { useRouter } from "expo-router";

import { Button } from "@/shared/components/button";
import { FormSheetLayout } from "@/shared/components/form-sheet";
import { formatStampTime } from "@/shared/utils/format-stamp-date-time";
import {
  localDateKey,
  localDateKeyFromIso,
} from "@/shared/utils/local-date-key";

import { StampPost } from "../components/stamp-post";
import { useRallies } from "../hooks/use-rallies";
import { useDeleteStamp, useRallyStamps } from "../hooks/use-stamps";
import { type Rally } from "../schemas/rallies";
import { confirmDeleteStamp } from "../utils/confirm-delete-stamp";

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
    (stamp) => localDateKeyFromIso(stamp.stampedAt) === dayKey,
  );

  return (
    <FormSheetLayout
      testID="rally-day-sheet"
      scrollable
      eyebrow={weekdayFormatter.format(date)}
      title={dateFormatter.format(date)}
    >
      {rally && rallyStamps && dayStamps.length === 0 ? (
        // A day with a stamp gets no add button: the same rally cannot hold
        // two past stamps on one local day.
        <View className="gap-5">
          <View
            testID="rally-day-empty"
            className="bg-accent-subtle border-continuous items-center gap-3 rounded-3xl py-8"
          >
            <View className="bg-background size-14 items-center justify-center rounded-full">
              <Text aria-hidden className="text-3xl opacity-60">
                {rally.emoji}
              </Text>
            </View>
            <Text className="text-accent-strong text-base font-semibold">
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
              onDelete={(stampId) =>
                confirmDeleteStamp(() => deleteStamp(stampId))
              }
            />
          ))
        : null}
    </FormSheetLayout>
  );
}
