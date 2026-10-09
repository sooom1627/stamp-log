import { Stack } from "expo-router";

import { useIdParam } from "@/features/rallies/hooks/use-id-param";
import { RallyDetailScreen } from "@/features/rallies/screens/rally-detail-screen";

export default function RallyDetailPage() {
  const rallyId = useIdParam("id");

  return (
    <>
      <Stack.Screen
        options={{
          headerLargeTitleEnabled: false,
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      {rallyId === undefined ? null : <RallyDetailScreen rallyId={rallyId} />}
    </>
  );
}
