import {
  useDateParam,
  useIdParam,
} from "@/features/rallies/hooks/use-route-param";
import { RallyDayScreen } from "@/features/rallies/screens/rally-day-screen";

export default function RallyDaySheet() {
  const rallyId = useIdParam("rallyId");
  const date = useDateParam("date");
  if (rallyId === undefined || date === undefined) return null;

  return <RallyDayScreen rallyId={rallyId} date={date} />;
}
