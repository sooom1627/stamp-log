import { useEffect } from "react";

import { Alert, FlatList, Text, View } from "react-native";

import { Stack, useRouter } from "expo-router";

import { LoadError } from "@/shared/components/load-error";
import { formatStampCount } from "@/shared/utils/format-stamp-count";
import { formatStampTime } from "@/shared/utils/format-stamp-date-time";
import { groupByLocalDay } from "@/shared/utils/group-by-local-day";

import { DayCard } from "../components/day-card";
import { RallyActionsMenu } from "../components/rally-actions-menu";
import { RallyMonthCalendar } from "../components/rally-month-calendar";
import { RallySummaryStats } from "../components/rally-summary-stats";
import { StampPost } from "../components/stamp-post";
import { useDeleteRally, useRallies } from "../hooks/use-rallies";
import { useDeleteStamp, useRallyStamps } from "../hooks/use-stamps";
import { type Rally } from "../schemas/rallies";
import { confirmDeleteStamp } from "../utils/confirm-delete-stamp";
import { buildRallySummary } from "../utils/rally-summary";

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
  const summary = stamps
    ? buildRallySummary(
        stamps.map((stamp) => stamp.stampedAt),
        new Date(),
      )
    : null;
  const sections = groupByLocalDay(stamps ?? [], (stamp) => stamp.stampedAt);

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

  return (
    <>
      <FlatList
        aria-label="Rally detail"
        className="bg-canvas flex-1"
        contentContainerClassName="gap-6 px-5 py-6"
        contentInsetAdjustmentBehavior="automatic"
        data={sections}
        keyExtractor={({ dateKey }) => dateKey}
        renderItem={({ item: { dateKey, data } }) => (
          <DayCard dateKey={dateKey} date={new Date(data[0].stampedAt)}>
            {data.map((stamp) => (
              <StampPost
                key={stamp.id}
                id={stamp.id}
                emoji={rally.emoji}
                title={formatStampTime(new Date(stamp.stampedAt))}
                memo={stamp.memo}
                onEdit={(stampId) =>
                  push({ pathname: "/edit-stamp", params: { stampId } })
                }
                onDelete={(stampId) =>
                  confirmDeleteStamp(() => deleteStamp(stampId))
                }
              />
            ))}
          </DayCard>
        )}
        ListHeaderComponent={
          <View className="items-center gap-4">
            <View
              testID="rally-top-panel"
              className="bg-accent-subtle border-continuous w-full items-center gap-2 rounded-3xl px-5 pt-6 pb-5"
            >
              <View className="bg-background size-20 items-center justify-center rounded-full">
                <Text className="text-5xl">{rally.emoji}</Text>
              </View>
              <Text
                selectable
                role="heading"
                className="text-foreground mt-1 text-2xl font-bold"
              >
                {rally.name}
              </Text>
              {stamps ? (
                <Text className="text-accent-strong text-base font-semibold">
                  {formatStampCount(stamps.length)}
                </Text>
              ) : null}
              {stamps ? <RallySummaryStats summary={summary} /> : null}
            </View>
            <RallyMonthCalendar
              stampDates={stamps?.map((stamp) => stamp.stampedAt) ?? []}
              emoji={rally.emoji}
              onPressDay={(date) =>
                push({
                  pathname: "/rally-day",
                  params: { rallyId: rally.id, date },
                })
              }
            />
            {stamps && stamps.length > 0 ? (
              <View className="w-full flex-row items-baseline justify-between pt-4">
                <Text
                  role="heading"
                  className="text-foreground text-xl font-bold"
                >
                  Stamps
                </Text>
                <Text
                  aria-label={`${stamps.length} stamps in the timeline`}
                  className="text-foreground-muted text-base"
                >
                  {stamps.length}
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <TimelineEmpty
            isError={isStampsError}
            isLoaded={isStampsLoaded}
            onRetry={() => void refetchStamps()}
          />
        }
      />
      <Stack.Title>{rally.name}</Stack.Title>
      <RallyActionsMenu
        onPastStamp={() =>
          push({ pathname: "/add-past-stamp", params: { rallyId: rally.id } })
        }
        onEdit={() =>
          push({ pathname: "/edit-rally", params: { rallyId: rally.id } })
        }
        onDelete={confirmDelete}
      />
    </>
  );
}
