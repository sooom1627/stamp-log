import { FlatList, Text, View } from "react-native";

import { StampPost } from "@/features/rallies/components/stamp-post";
import { useRallies } from "@/features/rallies/hooks/use-rallies";
import { useStamps } from "@/features/rallies/hooks/use-stamps";
import {
  TabRootHeader,
  TabRootWeekday,
} from "@/shared/components/tab-root-screen";
import {
  formatStampDay,
  formatStampTime,
} from "@/shared/utils/format-stamp-date-time";

export function RecordsTimelineScreen() {
  const { data: stamps } = useStamps();
  const { data: rallies } = useRallies();
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
            // ST-005 wires Edit / Delete.
            onEdit={() => {}}
            onDelete={() => {}}
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
          <View className="items-center py-12">
            <Text className="text-foreground-secondary">No stamps yet</Text>
          </View>
        }
      />
      <TabRootHeader />
    </>
  );
}
