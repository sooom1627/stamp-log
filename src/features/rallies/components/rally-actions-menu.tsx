import { Stack } from "expo-router";
import { Button, Host, Image, Menu } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  contentShape,
  frame,
  shapes,
} from "@expo/ui/swift-ui/modifiers";

import { useAccentColor } from "@/shared/hooks/use-accent-color";

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
  const accentColor = useAccentColor();

  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.View>
        <Host matchContents>
          <Menu
            testID="rally-actions-menu"
            label={
              <Image
                testID="rally-actions-menu-icon"
                systemName="ellipsis"
                color={accentColor}
                modifiers={[
                  frame({ width: 44, height: 44 }),
                  contentShape(shapes.rectangle()),
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
