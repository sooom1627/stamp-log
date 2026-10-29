import { useState } from "react";

import { useRouter } from "expo-router";

import { Button } from "@/shared/components/button";
import {
  FormField,
  FormSheetLayout,
  FormTextInput,
} from "@/shared/components/form-sheet";
import { stampPhotoUri } from "@/shared/db/stamp-photo-files";
import { useRally } from "@/shared/hooks/use-rallies";
import {
  useRallyStamps,
  useStamp,
  useUpdateStamp,
} from "@/shared/hooks/use-stamps";
import { type Rally } from "@/shared/schemas/rallies";
import { hasStampOnLocalDay, type Stamp } from "@/shared/schemas/stamps";

import {
  StampDateTimeErrors,
  StampDateTimeFields,
} from "../components/stamp-date-time-fields";
import { StampPhotoField } from "../components/stamp-photo-field";
import { useCloseWhenMissing } from "../hooks/use-close-when-missing";

// Pickers set seconds to 0, so compare at minute precision.
const toMinutes = (date: Date) => Math.floor(date.getTime() / 60_000);

type EditStampScreenProps = {
  stampId: number;
};

export function EditStampScreen({ stampId }: EditStampScreenProps) {
  const { data: stamp } = useStamp(stampId);
  const { data: rally } = useRally(stamp?.rallyId);
  // The same-day check needs only this stamp's rally.
  const { data: stamps } = useRallyStamps(stamp?.rallyId);

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
  // Saved photos are shown by their file URI; picked ones by the picker's URI.
  const savedPhotoUris = stamp.photos.map(({ fileName }) =>
    stampPhotoUri(fileName),
  );
  const [photoUris, setPhotoUris] = useState(savedPhotoUris);
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
    memo.trim() !== (stamp.memo ?? "") ||
    photoUris.join("\n") !== savedPhotoUris.join("\n");
  const canSave = isChanged && !isFuture && !hasStampOnDay && !isSaving;

  const handleSave = () => {
    if (!canSave) return;

    updateStamp(
      {
        id: stamp.id,
        stampedAt: stampedAt.toISOString(),
        memo,
        keptPhotoIds: stamp.photos
          .filter((_, index) => photoUris.includes(savedPhotoUris[index]))
          .map(({ id }) => id),
        newPhotoUris: photoUris.filter((uri) => !savedPhotoUris.includes(uri)),
      },
      { onSuccess: () => back() },
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

      <StampPhotoField photoUris={photoUris} onChangePhotoUris={setPhotoUris} />

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
