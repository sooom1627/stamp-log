import { Alert, Pressable, Text, View } from "react-native";

import { useRouter } from "expo-router";
import { Button, Host, Image, Menu } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  contentShape,
  frame,
  imageScale,
  shapes,
} from "@expo/ui/swift-ui/modifiers";

import { useResolveClassNames } from "uniwind";

import { useDeleteStamp } from "../hooks/use-stamps";
import { type Stamp } from "../schemas/stamps";

type StampPostProps = {
  stamp: Stamp;
  emoji: string;
  // Already formatted. Logs shows the rally name (title) and the time
  // (detail); rally screens show the time only.
  title: string;
  detail?: string;
  // Logs opens the stamp's rally. The … menu sits outside the pressable area
  // so its taps never reach this.
  onPress?: () => void;
};

// Every screen that lists stamps edits and deletes them the same way, so the
// post handles its own … menu.
export function StampPost({
  stamp,
  emoji,
  title,
  detail,
  onPress,
}: StampPostProps) {
  const { id, memo } = stamp;
  const { push } = useRouter();
  const { mutate: deleteStamp } = useDeleteStamp();
  const { color: menuColor } = useResolveClassNames("text-foreground-muted");

  const confirmDelete = () =>
    Alert.alert("Delete stamp?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteStamp(id) },
    ]);

  const content = (
    <>
      <View className="bg-accent-soft border-continuous size-9 items-center justify-center rounded-xl">
        <Text aria-hidden className="text-lg">
          {emoji}
        </Text>
      </View>
      <View className="flex-1">
        <View className="flex-row items-baseline gap-2">
          <Text selectable className="text-foreground text-base font-semibold">
            {title}
          </Text>
          {detail ? (
            <Text selectable className="text-foreground-muted text-sm">
              {detail}
            </Text>
          ) : null}
        </View>
        {memo ? (
          <Text selectable className="text-foreground-secondary text-base">
            {memo}
          </Text>
        ) : (
          <Text className="text-foreground-muted text-base">no memo</Text>
        )}
      </View>
    </>
  );

  return (
    <View testID={`stamp-row-${id}`} className="flex-row items-start gap-3">
      {onPress ? (
        <Pressable
          testID={`stamp-post-${id}`}
          role="link"
          onPress={onPress}
          className="flex-1 flex-row items-start gap-3"
        >
          {content}
        </Pressable>
      ) : (
        <View className="flex-1 flex-row items-start gap-3">{content}</View>
      )}
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
            onPress={() =>
              push({ pathname: "/edit-stamp", params: { stampId: id } })
            }
          />
          <Button
            testID={`stamp-delete-${id}`}
            label="Delete"
            systemImage="trash"
            role="destructive"
            onPress={confirmDelete}
          />
        </Menu>
      </Host>
    </View>
  );
}
