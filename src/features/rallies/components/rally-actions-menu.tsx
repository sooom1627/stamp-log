import { Stack } from "expo-router";

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
// tint, shared glass). The favorite star sits in the same toolbar group, so it
// shares the menu's glass.
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
        <Stack.Toolbar.MenuAction icon={archiveIcon} onPress={onToggleArchive}>
          {archiveLabel}
        </Stack.Toolbar.MenuAction>
        <Stack.Toolbar.MenuAction icon="trash" destructive onPress={onDelete}>
          {t("rallies.deleteRally")}
        </Stack.Toolbar.MenuAction>
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}
