import { useState } from "react";

import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";

import { localDateKey } from "@/shared/utils/local-date-key";

import { showAddMemoToast } from "../components/show-add-memo-toast";
import { useRallies } from "../hooks/use-rallies";
import { useSaveStamp, useStamps } from "../hooks/use-stamps";

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
  const rallies = useRallies();
  const stamps = useStamps();
  const save = useSaveStamp();

  const rally = rallies.data?.find((candidate) => candidate.id === rallyId);
  const isFuture = stampedAt.getTime() > Date.now();
  const hasStampOnDay =
    stamps.data?.some(
      (stamp) =>
        stamp.rallyId === rallyId &&
        localDateKey(new Date(stamp.stampedAt)) === localDateKey(stampedAt),
    ) ?? false;
  const canSave =
    rally !== undefined && !isFuture && !hasStampOnDay && !save.isPending;

  const handleDateChange = (_event: unknown, date: Date) =>
    setStampedAt((current) => {
      const next = new Date(current);
      next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      return next;
    });

  const handleTimeChange = (_event: unknown, date: Date) =>
    setStampedAt((current) => {
      const next = new Date(current);
      next.setHours(date.getHours(), date.getMinutes(), 0, 0);
      return next;
    });

  const handleSave = () => {
    if (!canSave) return;

    save.mutate(
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
      className="bg-surface dark:bg-main-dark gap-5 px-5 pb-6"
      style={{ paddingTop: headerHeight + 16 }}
    >
      {rally ? (
        <View className="flex-row items-center gap-2">
          <Text className="text-xl">{rally.emoji}</Text>
          <Text
            selectable
            numberOfLines={1}
            className="text-main min-w-0 flex-1 text-base font-semibold dark:text-slate-100"
          >
            {rally.name}
          </Text>
        </View>
      ) : null}

      <View className="flex-row items-center justify-between">
        <Text className="text-main text-sm font-semibold dark:text-slate-100">
          Date
        </Text>
        <DateTimePicker
          testID="past-stamp-date"
          mode="date"
          value={stampedAt}
          maximumDate={new Date()}
          accentColor="#f97316"
          onValueChange={handleDateChange}
        />
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-main text-sm font-semibold dark:text-slate-100">
          Time
        </Text>
        <DateTimePicker
          testID="past-stamp-time"
          mode="time"
          value={stampedAt}
          accentColor="#f97316"
          onValueChange={handleTimeChange}
        />
      </View>

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

      <Pressable
        role="button"
        accessibilityLabel={save.isPending ? "Saving…" : "Save"}
        accessibilityState={{ disabled: !canSave, busy: save.isPending }}
        disabled={!canSave}
        onPress={handleSave}
        className={
          canSave || save.isPending
            ? "border-continuous bg-main active:bg-main-hover mt-3 flex-row items-center justify-center gap-2 rounded-2xl py-4 dark:bg-slate-100"
            : "border-continuous bg-surface-muted-active mt-3 flex-row items-center justify-center gap-2 rounded-2xl py-4"
        }
      >
        {save.isPending ? (
          <ActivityIndicator
            size="small"
            colorClassName="accent-white dark:accent-main-dark"
          />
        ) : null}
        <Text
          className={
            canSave || save.isPending
              ? "dark:text-main-dark text-base font-semibold text-white"
              : "text-text-muted text-base font-semibold"
          }
        >
          {save.isPending ? "Saving…" : "Save"}
        </Text>
      </Pressable>
    </View>
  );
}
