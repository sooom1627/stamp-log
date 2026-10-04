import { useState } from "react";

import { useRouter } from "expo-router";

import { Button } from "@/shared/components/button";
import { FormSheetContainer } from "@/shared/components/form-sheet";

import { RallyHeading } from "../components/rally-heading";
import { showAddMemoToast } from "../components/show-add-memo-toast";
import {
  StampDateTimeErrors,
  StampDateTimeFields,
} from "../components/stamp-date-time-fields";
import { useRallies } from "../hooks/use-rallies";
import { useRallyStamps, useSaveStamp } from "../hooks/use-stamps";
import { hasStampOnLocalDay } from "../schemas/stamps";

type AddPastStampScreenProps = {
  rallyId: number;
};

function yesterdayNoon() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  date.setHours(12, 0, 0, 0);
  return date;
}

export function AddPastStampScreen({ rallyId }: AddPastStampScreenProps) {
  const [stampedAt, setStampedAt] = useState(yesterdayNoon);
  const { back } = useRouter();
  const { data: rallies } = useRallies();
  const { data: rallyStamps } = useRallyStamps(rallyId);
  const { mutate: saveStamp, isPending: isSaving } = useSaveStamp();

  const rally = rallies?.find((candidate) => candidate.id === rallyId);
  const isFuture = stampedAt.getTime() > Date.now();
  const hasStampOnDay = hasStampOnLocalDay(rallyStamps ?? [], {
    rallyId,
    date: stampedAt,
  });
  const canSave =
    rally !== undefined && !isFuture && !hasStampOnDay && !isSaving;

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
    <FormSheetContainer testID="add-past-stamp-form" className="gap-5">
      {rally ? <RallyHeading emoji={rally.emoji} name={rally.name} /> : null}

      <StampDateTimeFields
        value={stampedAt}
        onChange={setStampedAt}
        testIDPrefix="past-stamp"
      />

      <StampDateTimeErrors isFuture={isFuture} hasStampOnDay={hasStampOnDay} />

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
