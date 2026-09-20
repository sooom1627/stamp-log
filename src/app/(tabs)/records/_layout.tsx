import { Stack } from "expo-router";

import {
  ralliesListScreenOptions,
  tabRootScreenOptions,
} from "@/shared/components/tab-root-screen";

export default function RecordsLayout() {
  return (
    <Stack screenOptions={tabRootScreenOptions}>
      <Stack.Screen name="index" />
      <Stack.Screen name="rallies-list" options={ralliesListScreenOptions} />
    </Stack>
  );
}
