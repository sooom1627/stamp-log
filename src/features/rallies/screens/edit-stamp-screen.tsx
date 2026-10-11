import { useState } from "react";

import { useRouter } from "expo-router";

import { Button } from "@/shared/components/button";
import {
  FormField,
  FormSheetLayout,
  FormTextInput,
} from "@/shared/components/form-sheet";

import {
  StampDateTimeErrors,
  StampDateTimeFields,
} from "../components/stamp-date-time-fields";
import { useCloseWhenMissing } from "../hooks/use-close-when-missing";
import { useRally } from "../hooks/use-rallies";
import { useStamp, useStamps, useUpdateStamp } from "../hooks/use-stamps";
import { type Rally } from "../schemas/rallies";
import { hasStampOnLocalDay, type Stamp } from "../schemas/stamps";

// Pickers set seconds to 0, so compare at minute precision.
const toMinutes = (date: Date) => Math.floor(date.getTime() / 60_000);

type EditStampScreenProps = {
  stampId: number;
};

export function EditStampScreen({ stampId }: EditStampScreenProps) {
  const { data: stamp } = useStamp(stampId);
  const { data: rally } = useRally(stamp?.rallyId);
  const { data: stamps } = useStamps();

  // A stamp that does not exist closes the sheet, like an invalid id.
  useCloseWhenMissing(
    stamp === null || (stamp !== undefined && rally === null),
  );

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
  const { mutate: updateStamp, isPending: isSaving } = useUpdateStamp();

  const isFuture = stampedAt.getTime() > Date.now();
  const hasStampOnDay = hasStampOnLocalDay(stamps, {
    rallyId: stamp.rallyId,
    date: stampedAt,
    excludedId: stamp.id,
  });
  const isChanged =
    toMinutes(stampedAt) !== toMinutes(new Date(stamp.stampedAt)) ||
    memo.trim() !== (stamp.memo ?? "");
  const canSave = isChanged && !isFuture && !hasStampOnDay && !isSaving;

  const handleSave = () => {
    if (!canSave) return;

    updateStamp(
      { id: stamp.id, stampedAt: stampedAt.toISOString(), memo },
      { onSuccess: back },
    );
  };

  return (
    <FormSheetLayout
      testID="edit-stamp-form"
      eyebrow={`${rally.emoji} ${rally.name}`}
      title="Edit stamp"
    >
      <StampDateTimeFields
        value={stampedAt}
        onChange={setStampedAt}
        testIDPrefix="edit-stamp"
      />

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

      <StampDateTimeErrors isFuture={isFuture} hasStampOnDay={hasStampOnDay} />

      <Button
        label="Save"
        loadingLabel="Saving…"
        onPress={handleSave}
        disabled={!canSave}
        isLoading={isSaving}
        className="mt-3"
      />
    </FormSheetLayout>
  );
}
