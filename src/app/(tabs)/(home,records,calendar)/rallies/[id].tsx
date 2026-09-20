import { Stack } from "expo-router";

import { RallyDetailScreen } from "@/features/rallies/screens/rally-detail-screen";
import { rallyDetailScreenOptions } from "@/shared/components/tab-root-screen";

export default function RallyDetailRoute() {
  return (
    <>
      <Stack.Screen options={rallyDetailScreenOptions} />
      <RallyDetailScreen />
    </>
  );
}
