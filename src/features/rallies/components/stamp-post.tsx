import { Text, View } from "react-native";

import { Button, Host, Image, Menu } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  contentShape,
  frame,
  shapes,
} from "@expo/ui/swift-ui/modifiers";

import { useAccentColor } from "@/shared/hooks/use-accent-color";

import { type Stamp } from "../schemas/stamps";

type StampPostProps = {
  id: Stamp["id"];
  emoji: string;
  // Already formatted: the timeline shows the date and time, a single day
  // shows the time only.
  when: string;
  memo: Stamp["memo"];
  onEdit: (id: Stamp["id"]) => void;
  onDelete: (id: Stamp["id"]) => void;
};

export function StampPost({
  id,
  emoji,
  when,
  memo,
  onEdit,
  onDelete,
}: StampPostProps) {
  const accentColor = useAccentColor();

  return (
    <View className="flex-row gap-3">
      <Text aria-hidden className="text-2xl">
        {emoji}
      </Text>
      <View className="flex-1 gap-1">
        <Text selectable className="text-foreground-secondary text-sm">
          {when}
        </Text>
        {memo ? (
          <Text selectable className="text-foreground text-base">
            {memo}
          </Text>
        ) : null}
      </View>
      <Host matchContents>
        <Menu
          testID={`stamp-menu-${id}`}
          // Size the label itself: a frame outside a SwiftUI Menu does not
          // widen its hit area. 44pt is Apple's minimum tap target.
          label={
            <Image
              testID={`stamp-menu-icon-${id}`}
              systemName="ellipsis"
              color={accentColor}
              modifiers={[
                frame({ width: 44, height: 44 }),
                contentShape(shapes.rectangle()),
                accessibilityLabel("More"),
              ]}
            />
          }
        >
          <Button
            testID={`stamp-edit-${id}`}
            label="Edit"
            systemImage="pencil"
            onPress={() => onEdit(id)}
          />
          <Button
            testID={`stamp-delete-${id}`}
            label="Delete"
            systemImage="trash"
            role="destructive"
            onPress={() => onDelete(id)}
          />
        </Menu>
      </Host>
    </View>
  );
}
