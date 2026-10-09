import { Stack } from "expo-router";

import { RalliesListScreen } from "@/features/rallies/screens/rallies-list-screen";

export default function RalliesListPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerLargeTitleEnabled: false,
          title: "",
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <RalliesListScreen />
    </>
  );
}
