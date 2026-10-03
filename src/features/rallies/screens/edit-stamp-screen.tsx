import { useState } from "react";

import { Text, View } from "react-native";

import { useRouter } from "expo-router";
import { DatePicker, Host } from "@expo/ui/swift-ui";
import { tint } from "@expo/ui/swift-ui/modifiers";

import { Button } from "@/shared/components/button";
import {
  FormField,
  FormSheetContainer,
  FormTextInput,
} from "@/shared/components/form-sheet";
import { useAccentColor } from "@/shared/hooks/use-accent-color";
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
  const { data: rallies } = useRallies();
  const { data: stamps } = useStamps();

  const stamp = stamps?.find((candidate) => candidate.id === stampId);
  const rally = rallies?.find((candidate) => candidate.id === stamp?.rallyId);

  if (!stamp || !rally || !stamps) {
    return null;
  }

  return (
    <EditStampForm key={stamp.id} stamp={stamp} rally={rally} stamps={stamps} />
  );
}

type EditStampFormProps = {
  stamp: Stamp;
  rally: Rally;
  stamps: Stamp[];
};

function EditStampForm({ stamp, rally, stamps }: EditStampFormProps) {
  const [stampedAt, setStampedAt] = useState(() => new Date(stamp.stampedAt));
  const [memo, setMemo] = useState(stamp.memo ?? "");
  const { back } = useRouter();
  const accentColor = useAccentColor();
  const { mutate: updateStamp, isPending: isSaving } = useUpdateStamp();

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
  const canSave = isChanged && !isFuture && !hasStampOnDay && !isSaving;

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

    updateStamp(
      { id: stamp.id, stampedAt: stampedAt.toISOString(), memo },
      { onSuccess: back },
    );
  };

  return (
    <FormSheetContainer testID="edit-stamp-form" className="gap-5">
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
          modifiers={[tint(accentColor)]}
        />
      </Host>

      <Host matchContents={{ vertical: true }}>
        <DatePicker
          testID="edit-stamp-time"
          title="Time"
          selection={stampedAt}
          displayedComponents={["hourAndMinute"]}
          onDateChange={handleTimeChange}
          modifiers={[tint(accentColor)]}
        />
      </Host>

      <FormField label="Memo">
        <FormTextInput
          value={memo}
          onChangeText={setMemo}
          placeholder="Enter memo"
          aria-label="Memo"
          multiline
          textAlignVertical="top"
          className="max-h-48 min-h-32"
        />
      </FormField>

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
        label="Save"
        loadingLabel="Saving…"
        onPress={handleSave}
        disabled={!canSave}
        isLoading={isSaving}
        className="mt-3"
      />
    </FormSheetContainer>
  );
}
