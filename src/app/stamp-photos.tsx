import { useIdParam } from "@/features/rallies/hooks/use-id-param";
import { StampPhotosScreen } from "@/features/rallies/screens/stamp-photos-screen";

export default function StampPhotosPage() {
  const photoId = useIdParam("photoId");
  if (photoId === undefined) return null;

  return <StampPhotosScreen photoId={photoId} />;
}
