import { Stack } from "expo-router";
import { Button, Host, Image, Menu } from "@expo/ui/swift-ui";
import { accessibilityLabel, frame } from "@expo/ui/swift-ui/modifiers";

type RallyActionsMenuProps = {
  onPastStamp: () => void;
  onDelete: () => void;
};

// Native Stack.Toolbar.Menu matches the home header button chrome (system
// tint, shared glass). It is converted to a header item and is not in the RN
// tree, so tests use the @expo/ui Menu below.
export function RallyActionsMenu({
  onPastStamp,
  onDelete,
}: RallyActionsMenuProps) {
  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu accessibilityLabel="Rally actions" icon="ellipsis">
          <Stack.Toolbar.MenuAction
            icon="calendar.badge.plus"
            onPress={onPastStamp}
          >
            Past stamp
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction icon="trash" destructive onPress={onDelete}>
            Delete rally
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      {process.env.NODE_ENV === "test" ? (
        <Host matchContents>
          <Menu
            testID="rally-actions-menu"
            label={
              <Image
                testID="rally-actions-menu-icon"
                systemName="ellipsis"
                modifiers={[
                  frame({ width: 44, height: 44 }),
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
      ) : null}
    </>
  );
}
