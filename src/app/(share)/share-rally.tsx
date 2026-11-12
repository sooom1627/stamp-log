import { useIdParam } from "@/features/rallies/hooks/use-route-param";
import { ShareRallyScreen } from "@/features/share/screens/share-rally-screen";

export default function ShareRallySheet() {
  const rallyId = useIdParam("rallyId");
  if (rallyId === undefined) return null;

  return <ShareRallyScreen rallyId={rallyId} />;
}
