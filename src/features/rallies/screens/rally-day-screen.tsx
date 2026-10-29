import { Text, View } from "react-native";

import { useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/button";
import { FormSheetLayout } from "@/shared/components/form-sheet";
import { StampPost } from "@/shared/components/stamp-post";
import { useRally } from "@/shared/hooks/use-rallies";
import { useRallyStamps } from "@/shared/hooks/use-stamps";
import { type Rally } from "@/shared/schemas/rallies";
import { formatHeaderDate } from "@/shared/utils/format-header-date";
import { formatMediumDate } from "@/shared/utils/format-medium-date";
import { formatStampTime } from "@/shared/utils/format-stamp-date-time";
import {
  localDateKey,
  localDateKeyFromIso,
} from "@/shared/utils/local-date-key";

import { useCloseWhenMissing } from "../hooks/use-close-when-missing";

type RallyDayScreenProps = {
  rallyId: Rally["id"];
  // Local midnight of the day to show.
  date: Date;
};

export function RallyDayScreen({ rallyId, date }: RallyDayScreenProps) {
  const { push } = useRouter();
  const { t } = useTranslation();
  const { data: rally } = useRally(rallyId);
  const { data: rallyStamps } = useRallyStamps(rallyId);

  // A rally that does not exist closes the sheet, like an invalid id.
  useCloseWhenMissing(rally === null);
  const dayKey = localDateKey(date);
  const dayStamps = (rallyStamps ?? []).filter(
    (stamp) => localDateKeyFromIso(stamp.stampedAt) === dayKey,
  );

  return (
    <FormSheetLayout
      testID="rally-day-sheet"
      scrollable
      eyebrow={formatHeaderDate(date).weekday}
      title={formatMediumDate(date)}
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
              {t("rallies.noStampOnDay")}
            </Text>
          </View>
          <Button
            label={t("rallies.stampThisDay")}
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
              stamp={stamp}
              emoji={rally.emoji}
              title={formatStampTime(new Date(stamp.stampedAt))}
            />
          ))
        : null}
    </FormSheetLayout>
  );
}
