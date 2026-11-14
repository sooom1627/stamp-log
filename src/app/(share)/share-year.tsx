import { useYearPageParams } from "@/features/rallies/hooks/use-route-param";
import { ShareYearScreen } from "@/features/share/screens/share-year-screen";

export default function ShareYearSheet() {
  const params = useYearPageParams();
  if (params === undefined) return null;

  return <ShareYearScreen year={params.year} page={params.page} />;
}
