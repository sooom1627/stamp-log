import { type ComponentPropsWithRef } from "react";

import { ScrollView } from "react-native";

type TabScrollViewProps = Omit<
  ComponentPropsWithRef<typeof ScrollView>,
  "contentInsetAdjustmentBehavior"
>;

// The vertical scroll of every screen inside the tabs. The tab bar floats
// over the screen, so the scroll takes iOS's safe area as its inset: the
// safe area includes the tab bar (and the header where the scroll runs under
// it), so the end can scroll clear of the bar. Every tab screen then keeps
// the same room below its last content. Do not set a bottom padding on the
// content.
export function TabScrollView({
  contentContainerClassName = "",
  ...props
}: TabScrollViewProps) {
  return (
    <ScrollView
      {...props}
      contentContainerClassName={`pb-32 ${contentContainerClassName}`}
      contentInsetAdjustmentBehavior="automatic"
    />
  );
}
