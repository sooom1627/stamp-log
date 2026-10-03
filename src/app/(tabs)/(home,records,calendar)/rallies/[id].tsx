import { Stack } from "expo-router";

import { useIdParam } from "@/features/rallies/hooks/use-id-param";
import { RallyDetailScreen } from "@/features/rallies/screens/rally-detail-screen";
import { rallyDetailScreenOptions } from "@/shared/components/tab-root-screen";

export default function RallyDetailRoute() {
  const rallyId = useIdParam("id");

  return (
    <>
      <Stack.Screen options={rallyDetailScreenOptions} />
      {rallyId === undefined ? null : <RallyDetailScreen rallyId={rallyId} />}
    </>
  );
}
