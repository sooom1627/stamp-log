import { useState } from "react";

import { useColorScheme } from "react-native";

import { Stack } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";

import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { toast, Toaster } from "sonner-native";

import { createQueryClient } from "@/shared/query/create-query-client";

import "../../tailwind.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();
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
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="create-rally"
              options={{
                title: "Create rally",
                presentation: "formSheet",
                sheetGrabberVisible: true,
                sheetAllowedDetents: [0.5, 1],
              }}
            />
            <Stack.Screen
              name="add-stamp-memo"
              options={{
                title: "Add memo",
                presentation: "formSheet",
                sheetGrabberVisible: true,
                sheetAllowedDetents: [0.5, 1],
              }}
            />
          </Stack>
        </ThemeProvider>
        <Toaster position="bottom-center" closeButton />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
