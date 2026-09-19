import { useLocalSearchParams } from "expo-router";

import { AddStampMemoScreen } from "@/features/rallies/screens/add-stamp-memo-screen";

export default function AddStampMemo() {
  const { stampId } = useLocalSearchParams<{ stampId: string }>();

  return <AddStampMemoScreen stampId={Number(stampId)} />;
}
