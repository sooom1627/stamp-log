import { useState } from "react";

import { Stack } from "expo-router";

import { QueryClientProvider } from "@tanstack/react-query";

import { createQueryClient } from "@/shared/query/create-query-client";

import "../../tailwind.css";

export default function RootLayout() {
  const [queryClient] = useState(() => createQueryClient());

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
