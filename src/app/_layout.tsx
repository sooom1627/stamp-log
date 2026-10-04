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
import { useResolveClassNames } from "uniwind";

import { createQueryClient } from "@/shared/query/create-query-client";

import "../../tailwind.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const sheetBackgroundStyle = useResolveClassNames("bg-background");
  const sheetTitleStyle = useResolveClassNames("text-foreground");
  const formSheetOptions = {
    presentation: "formSheet",
    sheetGrabberVisible: true,
    sheetAllowedDetents: "fitToContents",
    contentStyle: sheetBackgroundStyle,
    headerStyle: sheetBackgroundStyle,
    headerTintColor: sheetTitleStyle.color,
    headerShadowVisible: false,
  } as const;
  const [queryClient] = useState(() =>
    createQueryClient({
      onMutationError: () => {
        toast.error("Something went wrong. Please try again.");
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
              options={{ ...formSheetOptions, headerShown: false }}
            />
            <Stack.Screen
              name="add-stamp-memo"
              options={{ ...formSheetOptions, title: "Add memo" }}
            />
            <Stack.Screen
              name="add-past-stamp"
              options={{ ...formSheetOptions, headerShown: false }}
            />
            <Stack.Screen
              name="edit-stamp"
              options={{ ...formSheetOptions, headerShown: false }}
            />
            <Stack.Screen
              name="rally-day"
              options={{ ...formSheetOptions, headerShown: false }}
            />
          </Stack>
        </ThemeProvider>
        <Toaster position="bottom-center" closeButton />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
