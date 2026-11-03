import { useDateParam } from "@/features/rallies/hooks/use-route-param";
import { LogsDayScreen } from "@/features/records/screens/logs-day-screen";

export default function LogsDaySheet() {
  const date = useDateParam("date");
  if (date === undefined) return null;

  return <LogsDayScreen date={date} />;
}
