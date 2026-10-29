import { Stack } from "expo-router";
import { Button, Host, Image, Menu } from "@expo/ui/swift-ui";
import { accessibilityLabel, frame } from "@expo/ui/swift-ui/modifiers";

import { useTranslation } from "react-i18next";

import { useAccentColor } from "@/shared/hooks/use-accent-color";

type RallyActionsMenuProps = {
  isFavorite: boolean;
  isArchived: boolean;
  onToggleFavorite: () => void;
  onToggleArchive: () => void;
  onPastStamp: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

// Native Stack.Toolbar.Menu matches the home header button chrome (system
// tint, shared glass). It is converted to a header item and is not in the RN
// tree, so tests use the @expo/ui Menu below. The favorite star sits in the
// same toolbar group, so it shares the menu's glass.
export function RallyActionsMenu({
  isFavorite,
  isArchived,
  onToggleFavorite,
  onToggleArchive,
  onPastStamp,
  onEdit,
  onDelete,
}: RallyActionsMenuProps) {
  const accentColor = useAccentColor();
  const { t } = useTranslation();
  const favoriteLabel = isFavorite
    ? t("rallies.removeFavorite")
    : t("rallies.addFavorite");
  const favoriteIcon = isFavorite ? "star.fill" : "star";
  const archiveLabel = isArchived
    ? t("rallies.unarchive")
    : t("rallies.archive");
  const archiveIcon = isArchived ? "arrow.uturn.backward" : "archivebox";

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel={favoriteLabel}
          icon={favoriteIcon}
          tintColor={isFavorite ? accentColor : undefined}
          onPress={onToggleFavorite}
        />
        <Stack.Toolbar.Menu
          accessibilityLabel={t("rallies.actions")}
          icon="ellipsis"
        >
          <Stack.Toolbar.MenuAction
            icon="calendar.badge.plus"
            onPress={onPastStamp}
          >
            {t("rallies.pastStamp")}
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction icon="pencil" onPress={onEdit}>
            {t("rallies.editRally")}
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            icon={archiveIcon}
            onPress={onToggleArchive}
          >
            {archiveLabel}
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction icon="trash" destructive onPress={onDelete}>
            {t("rallies.deleteRally")}
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      {process.env.NODE_ENV === "test" ? (
        <Host matchContents>
          <Button
            testID="rally-favorite"
            label={favoriteLabel}
            systemImage={favoriteIcon}
            onPress={onToggleFavorite}
          />
          <Menu
            testID="rally-actions-menu"
            label={
              <Image
                testID="rally-actions-menu-icon"
                systemName="ellipsis"
                modifiers={[
                  frame({ width: 44, height: 44 }),
                  accessibilityLabel(t("rallies.actions")),
                ]}
              />
            }
          >
            <Button
              testID="rally-action-past-stamp"
              label={t("rallies.pastStamp")}
              systemImage="calendar.badge.plus"
              onPress={onPastStamp}
            />
            <Button
              testID="rally-action-edit"
              label={t("rallies.editRally")}
              systemImage="pencil"
              onPress={onEdit}
            />
            <Button
              testID="rally-action-archive"
              label={archiveLabel}
              systemImage={archiveIcon}
              onPress={onToggleArchive}
            />
            <Button
              testID="rally-action-delete"
              label={t("rallies.deleteRally")}
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
