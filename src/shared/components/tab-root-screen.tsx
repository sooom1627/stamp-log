import { type ReactNode } from "react";

import { Text } from "react-native";

import { Stack, useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

import { formatHeaderDate } from "@/shared/utils/format-header-date";

import { AtoMark } from "./ato-mark";
import { TabScrollView } from "./tab-scroll-view";

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
  const { t } = useTranslation();

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
          accessibilityLabel={t("common.menu")}
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
      <TabScrollView
        aria-label={label}
        className="bg-canvas from-canvas-top via-canvas-mid to-canvas-bottom flex-1 bg-linear-to-b"
        contentContainerClassName="px-5"
      >
        <TabRootSubtitle>
          {formatHeaderDate(new Date()).weekday}
        </TabRootSubtitle>
        {children}
      </TabScrollView>
      <TabRootHeader />
    </>
  );
}
