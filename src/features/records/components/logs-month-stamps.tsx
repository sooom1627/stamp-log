import { Text, View } from "react-native";

import { useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

import { DayCard } from "@/shared/components/day-card";
import { StampPost } from "@/shared/components/stamp-post";
import { StampsAlbumPager } from "@/shared/components/stamps-album-pager";
import {
  StampsAlbumPicker,
  type StampsView,
} from "@/shared/components/stamps-album-picker";
import { TimelineEmpty } from "@/shared/components/timeline-empty";
import { useRalliesAndStamps } from "@/shared/hooks/use-rallies-and-stamps";
import { useFirstStampedAt, useMonthStamps } from "@/shared/hooks/use-stamps";
import { albumTiles } from "@/shared/utils/album-photos";
import { formatStampTime } from "@/shared/utils/format-stamp-date-time";
import { groupByLocalDay } from "@/shared/utils/group-by-local-day";
import { formatMonthHeading } from "@/shared/utils/month-grid";
import { stampsWithRallies } from "@/shared/utils/stamps-with-rallies";

import { PreviousMonthButton } from "./previous-month-button";

type LogsMonthStampsProps = {
  // The first day of the month whose stamps and album are shown (S-051).
  month: Date;
  view: StampsView;
  onChangeView: (view: StampsView) => void;
  // Called with the previous month by the button at the bottom.
  onShowMonth: (month: Date) => void;
};

// Logs below the calendar: the month's Stamps / Album switch and pages, or
// why there is nothing. Its own component, so that it renders only when its
// month or view changes, not on every turn of the calendar above.
export function LogsMonthStamps({
  month,
  view,
  onChangeView,
  onShowMonth,
}: LogsMonthStampsProps) {
  const { push } = useRouter();
  const { t } = useTranslation();
  const {
    rallies,
    stamps,
    isLoaded: isMonthLoaded,
    isError,
    retry,
  } = useRalliesAndStamps(useMonthStamps(month));
  // A stamp is shown once its rally is loaded, so every post has its name.
  const posts = stampsWithRallies(stamps ?? [], rallies ?? []);
  const sections = groupByLocalDay(posts, ({ stamp }) => stamp.stampedAt);
  const tiles = albumTiles(stamps ?? [], rallies ?? []);
  const photoCount = tiles.reduce((sum, tile) => sum + tile.photoCount, 0);
  const hasPosts = posts.length > 0;
  // The oldest stamp tells whether there are any stamps, and any before
  // this month.
  const { data: firstStampedAt, isError: isFirstError } = useFirstStampedAt();
  const isLoaded = isMonthLoaded && firstStampedAt !== undefined;
  const hasEarlierStamps =
    typeof firstStampedAt === "string" && new Date(firstStampedAt) < month;
  const previousMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1);
  const previousMonthButton = hasEarlierStamps ? (
    <PreviousMonthButton
      month={previousMonth}
      onPress={() => onShowMonth(previousMonth)}
    />
  ) : null;
  // Stamps exist, only not in this month.
  const isEmptyMonth =
    isLoaded && !isError && !hasPosts && typeof firstStampedAt === "string";

  if (isEmptyMonth) {
    return (
      <View className="items-center gap-2 py-12">
        <Text className="text-foreground-secondary">
          {t("records.noStampsInMonth", { month: formatMonthHeading(month) })}
        </Text>
        {previousMonthButton}
      </View>
    );
  }
  if (!hasPosts) {
    return (
      <TimelineEmpty
        isError={isError || isFirstError}
        isLoaded={isLoaded}
        message={t("rallies.noStamps")}
        onRetry={retry}
      />
    );
  }

  return (
    <>
      <View testID="logs-view-switch">
        {/* See-through so the screen's gradient shows; only the switch
            itself has a fill. */}
        <View className="px-5 pt-6 pb-2" testID="logs-view-switch-band">
          <StampsAlbumPicker
            testID="logs-view-picker"
            view={view}
            stampCount={posts.length}
            photoCount={photoCount}
            onChangeView={onChangeView}
          />
        </View>
      </View>
      <StampsAlbumPager
        testIDPrefix="logs-view"
        view={view}
        onChangeView={onChangeView}
        pageClassName="px-5 pt-2"
        stamps={
          <View className="gap-4">
            {sections.map((section) => (
              <DayCard
                key={section.dateKey}
                dateKey={section.dateKey}
                date={new Date(section.data[0].stamp.stampedAt)}
              >
                {section.data.map(({ stamp, rally }) => (
                  <StampPost
                    key={stamp.id}
                    stamp={stamp}
                    emoji={rally.emoji}
                    title={rally.name}
                    detail={formatStampTime(new Date(stamp.stampedAt))}
                    onPress={() =>
                      push({
                        pathname: "/rallies/[id]",
                        params: { id: rally.id },
                      })
                    }
                  />
                ))}
              </DayCard>
            ))}
          </View>
        }
        tiles={tiles}
        showsEmoji
      />
      <View className="pt-4">{previousMonthButton}</View>
    </>
  );
}
