import { useMonthParam } from "@/features/rallies/hooks/use-route-param";
import { ShareMonthScreen } from "@/features/share/screens/share-month-screen";

export default function ShareMonthSheet() {
  const month = useMonthParam("month");
  if (month === undefined) return null;

  return <ShareMonthScreen month={month} />;
}
