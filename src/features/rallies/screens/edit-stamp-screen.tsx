import { useState } from "react";

import { Text, TextInput, View } from "react-native";

import { useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { DatePicker, Host } from "@expo/ui/swift-ui";
import { tint } from "@expo/ui/swift-ui/modifiers";

import { Button } from "@/shared/components/button";
import { localDateKey } from "@/shared/utils/local-date-key";

import { useRallies } from "../hooks/use-rallies";
import { useStamps, useUpdateStamp } from "../hooks/use-stamps";
import { type Rally } from "../schemas/rallies";
import { type Stamp } from "../schemas/stamps";

// Pickers set seconds to 0, so compare at minute precision.
const toMinutes = (date: Date) => Math.floor(date.getTime() / 60_000);

type EditStampScreenProps = {
  stampId: number;
};

export function EditStampScreen({ stampId }: EditStampScreenProps) {
  const rallies = useRallies();
  const stamps = useStamps();

  const stamp = stamps.data?.find((candidate) => candidate.id === stampId);
  const rally = rallies.data?.find(
    (candidate) => candidate.id === stamp?.rallyId,
  );

  if (!stamp || !rally || !stamps.data) {
    return null;
  }

  return (
    <EditStampForm
      key={stamp.id}
      stamp={stamp}
      rally={rally}
      stamps={stamps.data}
    />
  );
}

type EditStampFormProps = {
  stamp: Stamp;
  rally: Rally;
  stamps: Stamp[];
};

// Do not use ScrollView / KeyboardAvoidingView inside formSheet
// (see create-rally-screen.tsx for why).
function EditStampForm({ stamp, rally, stamps }: EditStampFormProps) {
  const [stampedAt, setStampedAt] = useState(() => new Date(stamp.stampedAt));
  const [memo, setMemo] = useState(stamp.memo ?? "");
  const { back } = useRouter();
  const headerHeight = useHeaderHeight();
  const update = useUpdateStamp();

  const isFuture = stampedAt.getTime() > Date.now();
  const hasStampOnDay = stamps.some(
    (other) =>
      other.id !== stamp.id &&
      other.rallyId === stamp.rallyId &&
      localDateKey(new Date(other.stampedAt)) === localDateKey(stampedAt),
  );
  const isChanged =
    toMinutes(stampedAt) !== toMinutes(new Date(stamp.stampedAt)) ||
    memo.trim() !== (stamp.memo ?? "");
  const canSave = isChanged && !isFuture && !hasStampOnDay && !update.isPending;

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

    update.mutate(
      { id: stamp.id, stampedAt: stampedAt.toISOString(), memo },
      { onSuccess: back },
    );
  };

  return (
    <View
      testID="edit-stamp-form"
      className="bg-background gap-5 px-5 pb-6"
      style={{ paddingTop: headerHeight + 16 }}
    >
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

      <Host matchContents={{ vertical: true }}>
        <DatePicker
          testID="edit-stamp-date"
          title="Date"
          selection={stampedAt}
          displayedComponents={["date"]}
          range={{ end: new Date() }}
          onDateChange={handleDateChange}
          modifiers={[tint("#f97316")]}
        />
      </Host>

      <Host matchContents={{ vertical: true }}>
        <DatePicker
          testID="edit-stamp-time"
          title="Time"
          selection={stampedAt}
          displayedComponents={["hourAndMinute"]}
          onDateChange={handleTimeChange}
          modifiers={[tint("#f97316")]}
        />
      </Host>

      <View className="gap-2">
        <Text className="text-foreground text-sm font-semibold">Memo</Text>
        <TextInput
          value={memo}
          onChangeText={setMemo}
          placeholder="Enter memo"
          accessibilityLabel="Memo"
          multiline
          textAlignVertical="top"
          className="border-continuous border-border bg-surface-muted text-foreground focus:border-accent max-h-48 min-h-32 rounded-2xl border px-4 py-3.5 text-base"
          cursorColorClassName="accent-accent"
          selectionColorClassName="accent-accent"
          placeholderTextColorClassName="accent-text-muted"
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

      <Button
        label={update.isPending ? "Saving…" : "Save"}
        onPress={handleSave}
        disabled={!canSave}
        isLoading={update.isPending}
        className="mt-3"
      />
    </View>
  );
}
