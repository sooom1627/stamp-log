import { useLocalSearchParams } from "expo-router";

import { AddPastStampScreen } from "@/features/rallies/screens/add-past-stamp-screen";

export default function AddPastStamp() {
  const { rallyId } = useLocalSearchParams<{ rallyId: string }>();

  return <AddPastStampScreen rallyId={Number(rallyId)} />;
}
