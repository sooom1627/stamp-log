import { useIdParam } from "@/features/rallies/hooks/use-id-param";
import { AddPastStampScreen } from "@/features/rallies/screens/add-past-stamp-screen";

export default function AddPastStampSheet() {
  const rallyId = useIdParam("rallyId");
  if (rallyId === undefined) return null;

  return <AddPastStampScreen rallyId={rallyId} />;
}
