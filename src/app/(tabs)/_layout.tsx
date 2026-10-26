import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";

import { useResolveClassNames } from "uniwind";

import { hasOnboarded } from "@/features/onboarding/db/onboarding-state";

export default function TabsLayout() {
  const selectedTabStyle = useResolveClassNames("text-foreground");

  // First launch (S-047): onboarding comes before the tabs.
  if (!hasOnboarded()) return <Redirect href="/onboarding" />;

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      disableTransparentOnScrollEdge
      tintColor={selectedTabStyle.color}
    >
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md={{ default: "home", selected: "home_filled" }}
        />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="records">
        <NativeTabs.Trigger.Icon
          sf={{ default: "list.bullet", selected: "list.bullet" }}
          md="format_list_bulleted"
        />
        <NativeTabs.Trigger.Label>Logs</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
