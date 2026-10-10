import { FlatList, Text, View } from "react-native";

import { useRouter } from "expo-router";

import { StampPost } from "@/features/rallies/components/stamp-post";
import { useRallies } from "@/features/rallies/hooks/use-rallies";
import { useDeleteStamp, useStamps } from "@/features/rallies/hooks/use-stamps";
import { confirmDeleteStamp } from "@/features/rallies/utils/confirm-delete-stamp";
import { LoadError } from "@/shared/components/load-error";
import {
  TabRootHeader,
  TabRootWeekday,
} from "@/shared/components/tab-root-screen";
import {
  formatStampDay,
  formatStampTime,
} from "@/shared/utils/format-stamp-date-time";

type TimelineEmptyProps = {
  isError: boolean;
  isLoaded: boolean;
  onRetry: () => void;
};

// Nothing while loading, so No stamps yet never flashes before the posts.
function TimelineEmpty({ isError, isLoaded, onRetry }: TimelineEmptyProps) {
  if (isError) return <LoadError onRetry={onRetry} />;
  if (!isLoaded) return null;

  return (
    <View className="items-center py-12">
      <Text className="text-foreground-secondary">No stamps yet</Text>
    </View>
  );
}

export function RecordsTimelineScreen() {
  const { push } = useRouter();
  const {
    data: stamps,
    isError: isStampsError,
    refetch: refetchStamps,
  } = useStamps();
  const {
    data: rallies,
    isError: isRalliesError,
    refetch: refetchRallies,
  } = useRallies();
  const { mutate: deleteStamp } = useDeleteStamp();
  const isLoaded = stamps !== undefined && rallies !== undefined;
  const isError = isStampsError || isRalliesError;
  // A stamp is shown once its rally is loaded, so every post has its name.
  const posts = rallies
    ? (stamps ?? []).flatMap((stamp) => {
        const rally = rallies.find(
          (candidate) => candidate.id === stamp.rallyId,
        );
        return rally ? [{ stamp, rally }] : [];
      })
    : [];

  return (
    <>
      <FlatList
        aria-label="Logs timeline"
        className="bg-canvas flex-1"
        contentContainerClassName="gap-6 px-5 pb-32"
        contentInsetAdjustmentBehavior="automatic"
        data={posts}
        keyExtractor={({ stamp }) => String(stamp.id)}
        renderItem={({ item: { stamp, rally } }) => (
          <StampPost
            id={stamp.id}
            emoji={rally.emoji}
            title={formatStampDay(new Date(stamp.stampedAt))}
            detail={formatStampTime(new Date(stamp.stampedAt))}
            rallyName={rally.name}
            memo={stamp.memo}
            onPress={() =>
              push({
                pathname: "/records/rallies/[id]",
                params: { id: rally.id },
              })
            }
            onEdit={(stampId) =>
              push({ pathname: "/edit-stamp", params: { stampId } })
            }
            onDelete={(stampId) =>
              confirmDeleteStamp(() => deleteStamp(stampId))
            }
          />
        )}
        ListHeaderComponent={
          <View>
            <TabRootWeekday />
            {posts.length > 0 ? (
              <View className="flex-row items-baseline justify-between">
                <Text
                  role="heading"
                  className="text-foreground text-xl font-bold"
                >
                  Stamps
                </Text>
                <Text
                  aria-label={`${posts.length} stamps in the timeline`}
                  className="text-foreground-muted text-base"
                >
                  {posts.length}
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <TimelineEmpty
            isError={isError}
            isLoaded={isLoaded}
            onRetry={() => {
              void refetchStamps();
              void refetchRallies();
            }}
          />
        }
      />
      <TabRootHeader />
    </>
  );
}
