import { Pressable, Text, View } from "react-native";

import { Link } from "expo-router";

import { useTranslation } from "react-i18next";

import { ShareIcon } from "@/shared/components/icons";
import { MonthStampGrid } from "@/shared/components/month-stamp-grid";
import { formatRallyCount } from "@/shared/utils/format-rally-count";
import { formatStampCount } from "@/shared/utils/format-stamp-count";
import { localDateKey } from "@/shared/utils/local-date-key";
import { type MonthShare } from "@/shared/utils/month-share-grid";

import { TopCard } from "./top-card";

const monthNameFormatter = new Intl.DateTimeFormat("en-US", { month: "long" });

type LastMonthCardProps = {
  // Last month's first local day.
  month: Date;
  share: MonthShare;
  width: number;
  position: string;
};

// Home's second top card in the first days of a month (S-058 T-003): last
// month's counts, Share, and the same grid the month image draws. Not about
// today, so it keeps off the accent.
export function LastMonthCard({
  month,
  share,
  width,
  position,
}: LastMonthCardProps) {
  const { t } = useTranslation();
  const monthName = monthNameFormatter.format(month);

  return (
    <TopCard
      label={monthName}
      detail={t("home.lastMonth")}
      tone="plain"
      spokenLabel={position}
      // Share is a button of its own, so the card is not read as one element.
      isGrouped={false}
      width={width}
      testID="last-month-card"
    >
      <View className="flex-1 flex-row items-end gap-3">
        <View className="gap-1">
          <Text className="text-foreground text-headline font-semibold">
            {formatStampCount(share.stampCount)}
          </Text>
          <Text className="text-foreground-secondary text-subhead">
            {formatRallyCount(share.rallyCount)}
          </Text>
          <Link
            href={{
              pathname: "/share-month",
              params: { month: localDateKey(month).slice(0, 7) },
            }}
            asChild
          >
            <Pressable
              role="button"
              aria-label={t("share.title")}
              hitSlop={8}
              className="bg-surface-muted mt-2 flex-row items-center gap-1 self-start rounded-full px-3 py-1"
            >
              <ShareIcon colorClassName="accent-foreground" size={12} />
              <Text className="text-foreground text-footnote font-semibold">
                {t("share.share")}
              </Text>
            </Pressable>
          </Link>
        </View>
        <View className="flex-1" aria-hidden>
          <MonthStampGrid month={month} share={share} />
        </View>
      </View>
    </TopCard>
  );
}
