import { useIdParam } from "@/features/rallies/hooks/use-id-param";
import { EditRallyScreen } from "@/features/rallies/screens/edit-rally-screen";

export default function EditRallySheet() {
  const rallyId = useIdParam("rallyId");
  if (rallyId === undefined) return null;

  return <EditRallyScreen rallyId={rallyId} />;
}
