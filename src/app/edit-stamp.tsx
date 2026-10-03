import { useLocalSearchParams } from "expo-router";

import { EditStampScreen } from "@/features/rallies/screens/edit-stamp-screen";

export default function EditStamp() {
  const { stampId } = useLocalSearchParams<{ stampId: string }>();

  return <EditStampScreen stampId={Number(stampId)} />;
}
