import { useState } from "react";

import { Stack } from "expo-router";

import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { toast, Toaster } from "sonner-native";

import { createQueryClient } from "@/shared/query/create-query-client";

import "../../tailwind.css";

export default function RootLayout() {
  const [queryClient] = useState(() =>
    createQueryClient({
      onMutationError: () => {
        toast.error("うまくいきませんでした。もう一度お試しください。");
      },
    }),
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          <Stack.Screen
            name="add-stamp-memo"
            options={{
              title: "メモを追加",
              presentation: "formSheet",
              sheetGrabberVisible: true,
              sheetAllowedDetents: [0.5, 1],
            }}
          />
        </Stack>
        <Toaster position="bottom-center" closeButton />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
