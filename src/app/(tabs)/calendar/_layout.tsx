import { Stack } from "expo-router";

import {
  ralliesListScreenOptions,
  tabRootScreenOptions,
} from "@/shared/components/tab-root-screen";

export default function CalendarLayout() {
  return (
    <Stack screenOptions={tabRootScreenOptions}>
      <Stack.Screen name="index" />
      <Stack.Screen name="rallies-list" options={ralliesListScreenOptions} />
    </Stack>
  );
}
