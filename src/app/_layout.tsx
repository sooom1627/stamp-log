import { Stack } from "expo-router";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "../../tailwind.css";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
