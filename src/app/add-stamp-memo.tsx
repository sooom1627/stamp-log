import { useIdParam } from "@/features/rallies/hooks/use-id-param";
import { AddStampMemoScreen } from "@/features/rallies/screens/add-stamp-memo-screen";

export default function AddStampMemoSheet() {
  const stampId = useIdParam("stampId");
  if (stampId === undefined) return null;

  return <AddStampMemoScreen stampId={stampId} />;
}
