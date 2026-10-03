import { useState } from "react";

import { Text, View } from "react-native";

import { useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { DatePicker, Host } from "@expo/ui/swift-ui";
import { tint } from "@expo/ui/swift-ui/modifiers";

import { Button } from "@/shared/components/button";
import { useAccentColor } from "@/shared/hooks/use-accent-color";
import { localDateKey } from "@/shared/utils/local-date-key";

import { showAddMemoToast } from "../components/show-add-memo-toast";
import { useRallies } from "../hooks/use-rallies";
import { useRallyStamps, useSaveStamp } from "../hooks/use-stamps";

type AddPastStampScreenProps = {
  rallyId: number;
};

function yesterdayNoon() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  date.setHours(12, 0, 0, 0);
  return date;
}

// Do not use ScrollView / KeyboardAvoidingView inside formSheet
// (see create-rally-screen.tsx for why).
export function AddPastStampScreen({ rallyId }: AddPastStampScreenProps) {
  const [stampedAt, setStampedAt] = useState(yesterdayNoon);
  const { back } = useRouter();
  const headerHeight = useHeaderHeight();
  const accentColor = useAccentColor();
  const { data: rallies } = useRallies();
  const { data: rallyStamps } = useRallyStamps(rallyId);
  const { mutate: saveStamp, isPending: isSaving } = useSaveStamp();

  const rally = rallies?.find((candidate) => candidate.id === rallyId);
  const isFuture = stampedAt.getTime() > Date.now();
  const hasStampOnDay =
    rallyStamps?.some(
      (stamp) =>
        localDateKey(new Date(stamp.stampedAt)) === localDateKey(stampedAt),
    ) ?? false;
  const canSave =
    rally !== undefined && !isFuture && !hasStampOnDay && !isSaving;

  const handleDateChange = (date: Date) =>
    setStampedAt((current) => {
      const next = new Date(current);
      next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      return next;
    });

  const handleTimeChange = (date: Date) =>
    setStampedAt((current) => {
      const next = new Date(current);
      next.setHours(date.getHours(), date.getMinutes(), 0, 0);
      return next;
    });

  const handleSave = () => {
    if (!canSave) return;

    saveStamp(
      { rallyId, stampedAt: stampedAt.toISOString() },
      {
        onSuccess: (stamp) => {
          back();
          showAddMemoToast(stamp.id);
        },
      },
    );
  };

  return (
    <View
      testID="add-past-stamp-form"
      className="bg-background gap-5 px-5 pb-6"
      style={{ paddingTop: headerHeight + 16 }}
    >
      {rally ? (
        <View className="flex-row items-center gap-2">
          <Text className="text-xl">{rally.emoji}</Text>
          <Text
            selectable
            numberOfLines={1}
            className="text-foreground min-w-0 flex-1 text-base font-semibold"
          >
            {rally.name}
          </Text>
        </View>
      ) : null}

      <Host matchContents={{ vertical: true }}>
        <DatePicker
          testID="past-stamp-date"
          title="Date"
          selection={stampedAt}
          displayedComponents={["date"]}
          range={{ end: new Date() }}
          onDateChange={handleDateChange}
          modifiers={[tint(accentColor)]}
        />
      </Host>

      <Host matchContents={{ vertical: true }}>
        <DatePicker
          testID="past-stamp-time"
          title="Time"
          selection={stampedAt}
          displayedComponents={["hourAndMinute"]}
          onDateChange={handleTimeChange}
          modifiers={[tint(accentColor)]}
        />
      </Host>

      {isFuture ? (
        <Text className="text-danger text-sm">
          Future times can't be saved.
        </Text>
      ) : null}
      {hasStampOnDay ? (
        <Text className="text-danger text-sm">
          This rally already has a stamp on this day.
        </Text>
      ) : null}

      <Button
        label={isSaving ? "Saving…" : "Save"}
        onPress={handleSave}
        disabled={!canSave}
        isLoading={isSaving}
        className="mt-3"
      />
    </View>
  );
}
