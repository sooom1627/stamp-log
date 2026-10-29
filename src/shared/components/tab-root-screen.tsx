import { type ReactNode } from "react";

import { ScrollView, Text, View } from "react-native";

import { Stack, useRouter } from "expo-router";

import { formatHeaderDate } from "@/shared/utils/format-header-date";

import { AtoMark } from "./ato-mark";

export const tabRootScreenOptions = {
  headerLargeTitleEnabled: true,
} as const;

// The line under the large title. Screens that scroll a FlatList put it in
// their list header.
export function TabRootSubtitle({ children }: { children: string }) {
  return (
    <Text className="text-foreground-secondary mb-4 text-sm">{children}</Text>
  );
}

// The large title (today's month and day unless given) and the toolbar shared
// by tab roots.
export function TabRootHeader({ title }: { title?: string }) {
  const { monthDay } = formatHeaderDate(new Date());
  const { push } = useRouter();

  return (
    <>
      <Stack.Title large>{title ?? monthDay}</Stack.Title>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.View>
          <AtoMark size={32} />
        </Stack.Toolbar.View>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel="Menu"
          icon="line.3.horizontal"
          onPress={() => push("/settings")}
        />
      </Stack.Toolbar>
    </>
  );
}

type TabRootScreenProps = {
  // Names the screen's content. Native tabs keep every tab mounted, so this
  // also tells tab roots apart.
  label?: string;
  children: ReactNode;
};

export function TabRootScreen({ label, children }: TabRootScreenProps) {
  return (
    <>
      <ScrollView
        aria-label={label}
        className="bg-canvas from-home-top via-home-mid to-home-bottom flex-1 bg-linear-to-b"
        contentContainerClassName="px-5 pb-32"
        contentInsetAdjustmentBehavior="automatic"
      >
        <TabRootSubtitle>
          {formatHeaderDate(new Date()).weekday}
        </TabRootSubtitle>
        {children}
      </ScrollView>
      <TabRootHeader />
    </>
  );
}
