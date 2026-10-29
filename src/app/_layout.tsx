import { useState } from "react";

import { useColorScheme } from "react-native";

import { Stack, type ErrorBoundaryProps } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";

import { QueryClientProvider } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { toast, Toaster } from "sonner-native";
import { useResolveClassNames } from "uniwind";

import { RenderError } from "@/shared/components/render-error";
import { createQueryClient } from "@/shared/query/create-query-client";

import "@/shared/i18n";
import "../../tailwind.css";

// Catches a render error in any route; the layout itself is replaced until retry.
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <RenderError retry={retry} />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const sheetBackgroundStyle = useResolveClassNames("bg-background");
  const { t } = useTranslation();
  const formSheetOptions = {
    presentation: "formSheet",
    sheetGrabberVisible: true,
    sheetAllowedDetents: "fitToContents",
    contentStyle: sheetBackgroundStyle,
    // Each sheet draws its own heading (FormSheetLayout).
    headerShown: false,
  } as const;
  const [queryClient] = useState(() =>
    createQueryClient({
      onMutationError: () => {
        toast.error(t("common.errorTryAgain"));
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
              name="onboarding"
              // Finishing replaces it with Home; there is nothing to go back to.
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
              name="about-ato"
              // Opened over Settings; Close and Done bring it back.
              options={{ presentation: "fullScreenModal", headerShown: false }}
            />
            <Stack.Screen name="create-rally" options={formSheetOptions} />
            <Stack.Screen name="edit-rally" options={formSheetOptions} />
            <Stack.Screen name="add-stamp-memo" options={formSheetOptions} />
            <Stack.Screen name="add-past-stamp" options={formSheetOptions} />
            <Stack.Screen name="edit-stamp" options={formSheetOptions} />
            <Stack.Screen name="rally-day" options={formSheetOptions} />
            <Stack.Screen name="logs-day" options={formSheetOptions} />
            <Stack.Screen name="settings" options={formSheetOptions} />
            <Stack.Screen
              name="stamp-photos"
              options={{
                // iOS full-screen presentation: it has no swipe-down dismiss,
                // so the screen closes with its own Close button only.
                presentation: "fullScreenModal",
                headerShown: false,
                statusBarStyle: "light",
              }}
            />
          </Stack>
        </ThemeProvider>
        <Toaster position="bottom-center" closeButton />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
