import { Stack } from "expo-router";

import { RalliesListScreen } from "@/features/rallies/screens/rallies-list-screen";
import { ralliesListScreenOptions } from "@/shared/components/tab-root-screen";

export default function RalliesListRoute() {
  return (
    <>
      <Stack.Screen options={ralliesListScreenOptions} />
      <RalliesListScreen />
    </>
  );
}
