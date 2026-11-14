import { useYearParam } from "@/features/rallies/hooks/use-route-param";
import { YearReviewScreen } from "@/features/share/screens/year-review-screen";

export default function YearReviewPage() {
  const year = useYearParam("year");
  if (year === undefined) return null;

  return <YearReviewScreen year={year} />;
}
