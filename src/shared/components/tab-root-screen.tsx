import { type ReactNode } from "react";

import { ScrollView, Text, View } from "react-native";

import { Stack } from "expo-router";

import { formatHeaderDate } from "@/shared/utils/format-header-date";
import { getSessionGreeting } from "@/shared/utils/session-greeting";

export const tabRootScreenOptions = {
  headerLargeTitleEnabled: true,
} as const;

type TabRootScreenProps = {
  children: ReactNode;
  floatingAction?: ReactNode;
};

export function TabRootScreen({
  children,
  floatingAction,
}: TabRootScreenProps) {
  return (
    <>
      <ScrollView
        className="bg-background flex-1"
        contentContainerClassName="px-5 pb-32"
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text className="text-foreground-secondary mb-4 text-sm">
          {formatHeaderDate(new Date())}
        </Text>
        {children}
      </ScrollView>
      {floatingAction}
      <Stack.Title large>{getSessionGreeting()}</Stack.Title>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.View>
          <View
            aria-label="Logo"
            className="size-8 rounded-full bg-[#c7c7cc]"
          />
        </Stack.Toolbar.View>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel="Menu"
          icon="line.3.horizontal"
          onPress={() => {}}
        />
      </Stack.Toolbar>
    </>
  );
}
