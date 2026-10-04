import { Text, View } from "react-native";

import { Button, Host, Image, Menu } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  contentShape,
  frame,
  imageScale,
  shapes,
} from "@expo/ui/swift-ui/modifiers";

import { useResolveClassNames } from "uniwind";

import { type Stamp } from "../schemas/stamps";

type StampPostProps = {
  id: Stamp["id"];
  emoji: string;
  // Already formatted. The timeline shows the day (title) and the time
  // (detail); a single day shows the time only.
  title: string;
  detail?: string;
  memo: Stamp["memo"];
  onEdit: (id: Stamp["id"]) => void;
  onDelete: (id: Stamp["id"]) => void;
};

export function StampPost({
  id,
  emoji,
  title,
  detail,
  memo,
  onEdit,
  onDelete,
}: StampPostProps) {
  const { color: menuColor } = useResolveClassNames("text-foreground-muted");

  return (
    <View className="flex-col gap-2">
      <View className="flex-row gap-3">
        <View className="bg-accent-soft border-continuous size-9 items-center justify-center rounded-xl">
          <Text aria-hidden className="text-lg">
            {emoji}
          </Text>
        </View>
        <View className="flex-1 gap-1">
          <View className="min-h-9 flex-row items-baseline gap-2 pt-1.5">
            <Text
              selectable
              className="text-foreground text-base font-semibold"
            >
              {title}
            </Text>
            {detail ? (
              <Text selectable className="text-foreground-muted text-sm">
                {detail}
              </Text>
            ) : null}
          </View>
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
                color={menuColor}
                modifiers={[
                  imageScale("small"),
                  frame({ width: 36, height: 36 }),
                  contentShape(shapes.circle()),
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
      <View className="px-2">
        {memo ? (
          <Text
            selectable
            className="text-foreground-secondary text-base leading-6"
          >
            {memo}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
