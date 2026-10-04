import { useEffect } from "react";

import { Alert, FlatList, Text, View } from "react-native";

import { Stack, useRouter } from "expo-router";
import { Button, Host, Image, Menu } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  contentShape,
  frame,
  shapes,
} from "@expo/ui/swift-ui/modifiers";

import { Button as AppButton } from "@/shared/components/button";
import { LoadError } from "@/shared/components/load-error";
import { useAccentColor } from "@/shared/hooks/use-accent-color";
import { formatStampCount } from "@/shared/utils/format-stamp-count";
import { formatStampDateTime } from "@/shared/utils/format-stamp-date-time";

import { RallyMonthCalendar } from "../components/rally-month-calendar";
import { useDeleteRally, useRallies } from "../hooks/use-rallies";
import { useDeleteStamp, useRallyStamps } from "../hooks/use-stamps";
import { type Rally } from "../schemas/rallies";
import { type Stamp } from "../schemas/stamps";

type StampPostProps = {
  id: Stamp["id"];
  emoji: string;
  stampedAt: Stamp["stampedAt"];
  memo: Stamp["memo"];
  onEdit: (id: Stamp["id"]) => void;
  onDelete: (id: Stamp["id"]) => void;
};

function StampPost({
  id,
  emoji,
  stampedAt,
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
          {formatStampDateTime(new Date(stampedAt))}
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

type TimelineEmptyProps = {
  isError: boolean;
  isLoaded: boolean;
  onRetry: () => void;
};

function TimelineEmpty({ isError, isLoaded, onRetry }: TimelineEmptyProps) {
  if (isError) return <LoadError onRetry={onRetry} />;
  if (!isLoaded) return null;

  return (
    <View className="items-center py-12">
      <Text className="text-foreground-secondary">No stamps yet</Text>
    </View>
  );
}

type RallyDetailScreenProps = {
  rallyId: Rally["id"];
};

export function RallyDetailScreen({ rallyId }: RallyDetailScreenProps) {
  const { back, push } = useRouter();
  const { data: rallies, isSuccess: isRalliesLoaded } = useRallies();
  const {
    data: stamps,
    isError: isStampsError,
    isSuccess: isStampsLoaded,
    refetch: refetchStamps,
  } = useRallyStamps(rallyId);
  const { mutate: deleteRally } = useDeleteRally();
  const { mutate: deleteStamp } = useDeleteStamp();
  const rally = rallies?.find((candidate) => candidate.id === rallyId);

  useEffect(() => {
    if (isRalliesLoaded && !rally) {
      back();
    }
  }, [back, isRalliesLoaded, rally]);

  if (!rally) {
    return null;
  }

  const confirmDelete = () =>
    Alert.alert("Delete rally?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteRally(rally.id, { onSuccess: back }),
      },
    ]);

  const confirmDeleteStamp = (stampId: Stamp["id"]) =>
    Alert.alert("Delete stamp?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteStamp(stampId),
      },
    ]);

  return (
    <>
      <FlatList
        aria-label="Rally detail"
        className="bg-background flex-1"
        contentContainerClassName="gap-6 px-5 py-6"
        contentInsetAdjustmentBehavior="automatic"
        data={stamps}
        keyExtractor={(stamp) => String(stamp.id)}
        renderItem={({ item }) => (
          <StampPost
            id={item.id}
            emoji={rally.emoji}
            stampedAt={item.stampedAt}
            memo={item.memo}
            onEdit={(stampId) =>
              push({ pathname: "/edit-stamp", params: { stampId } })
            }
            onDelete={confirmDeleteStamp}
          />
        )}
        ListHeaderComponent={
          <View className="items-center gap-3">
            <Text className="text-5xl">{rally.emoji}</Text>
            <Text
              selectable
              role="heading"
              className="text-foreground text-2xl font-semibold"
            >
              {rally.name}
            </Text>
            {stamps ? (
              <Text className="text-foreground-secondary text-base">
                {formatStampCount(stamps.length)}
              </Text>
            ) : null}
            <RallyMonthCalendar
              stampDates={stamps?.map((stamp) => stamp.stampedAt) ?? []}
            />
          </View>
        }
        ListEmptyComponent={
          <TimelineEmpty
            isError={isStampsError}
            isLoaded={isStampsLoaded}
            onRetry={() => void refetchStamps()}
          />
        }
        ListFooterComponent={
          <View className="gap-6">
            <AppButton
              label="Past stamp"
              onPress={() =>
                push({
                  pathname: "/add-past-stamp",
                  params: { rallyId: rally.id },
                })
              }
            />
            <AppButton
              label="Delete rally"
              aria-label={`Delete ${rally.name}`}
              variant="danger"
              onPress={confirmDelete}
            />
          </View>
        }
      />
      <Stack.Title>{rally.name}</Stack.Title>
    </>
  );
}
