import { useLocalSearchParams } from "expo-router";

import {
  useDateParam,
  useIdParam,
} from "@/features/rallies/hooks/use-id-param";
import { AddPastStampScreen } from "@/features/rallies/screens/add-past-stamp-screen";

function PastStampForDay({ rallyId }: { rallyId: number }) {
  const date = useDateParam("date");
  if (date === undefined) return null;

  return <AddPastStampScreen rallyId={rallyId} day={date} />;
}

export default function AddPastStampSheet() {
  const rallyId = useIdParam("rallyId");
  const { date } = useLocalSearchParams();
  if (rallyId === undefined) return null;

  // `date` is optional: validate it only when the rally day sheet passed one.
  if (date !== undefined) return <PastStampForDay rallyId={rallyId} />;
  return <AddPastStampScreen rallyId={rallyId} />;
}
