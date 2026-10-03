import { useIdParam } from "@/features/rallies/hooks/use-id-param";
import { EditStampScreen } from "@/features/rallies/screens/edit-stamp-screen";

export default function EditStampSheet() {
  const stampId = useIdParam("stampId");
  if (stampId === undefined) return null;

  return <EditStampScreen stampId={stampId} />;
}
