import { useState } from "react";

import { Stack } from "expo-router";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "../../tailwind.css";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

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
