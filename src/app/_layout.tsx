import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "ホーム" }} />
      <Stack.Screen
        name="create-rally"
        options={{
          title: "ラリーを作る",
          presentation: "formSheet",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.5, 1],
        }}
      />
    </Stack>
  );
}
