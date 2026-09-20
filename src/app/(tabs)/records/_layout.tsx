import { Stack } from "expo-router";

import { tabRootScreenOptions } from "@/shared/components/tab-root-screen";

export default function RecordsLayout() {
  return (
    <Stack screenOptions={tabRootScreenOptions}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
