import { Stack } from "expo-router";
import { Button, Host, Image, Menu } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  background,
  contentShape,
  frame,
  shapes,
} from "@expo/ui/swift-ui/modifiers";

import { useResolveClassNames } from "uniwind";

type RallyActionsMenuProps = {
  onPastStamp: () => void;
  onDelete: () => void;
};

// A custom header view (not Stack.Toolbar.Menu): native toolbar menus are not
// rendered as React elements, so tests could not press them.
export function RallyActionsMenu({
  onPastStamp,
  onDelete,
}: RallyActionsMenuProps) {
  const { color: iconColor } = useResolveClassNames("text-foreground");
  const { backgroundColor: circleColor = "transparent" } =
    useResolveClassNames("bg-surface-muted");

  return (
    <Stack.Toolbar placement="right">
      {/* Draw our own flat circle: the shared glass background stretches a
          custom view into a wide capsule. */}
      <Stack.Toolbar.View hidesSharedBackground>
        <Host matchContents>
          <Menu
            testID="rally-actions-menu"
            label={
              <Image
                testID="rally-actions-menu-icon"
                systemName="ellipsis"
                color={iconColor}
                modifiers={[
                  frame({ width: 44, height: 44 }),
                  background(circleColor, shapes.circle()),
                  contentShape(shapes.circle()),
                  accessibilityLabel("Rally actions"),
                ]}
              />
            }
          >
            <Button
              testID="rally-action-past-stamp"
              label="Past stamp"
              systemImage="calendar.badge.plus"
              onPress={onPastStamp}
            />
            <Button
              testID="rally-action-delete"
              label="Delete rally"
              systemImage="trash"
              role="destructive"
              onPress={onDelete}
            />
          </Menu>
        </Host>
      </Stack.Toolbar.View>
    </Stack.Toolbar>
  );
}
