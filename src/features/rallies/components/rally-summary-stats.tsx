import { Text, View } from "react-native";

import { useTranslation } from "react-i18next";

import { formatDaysAgo } from "@/shared/utils/format-days-ago";
import { formatMediumDate } from "@/shared/utils/format-medium-date";

import { type RallySummary } from "../utils/rally-summary";

type SummaryStatProps = {
  label: string;
  value: string;
  // Draws the thin line that separates this column from the one before it.
  hasDivider?: boolean;
};

function SummaryStat({ label, value, hasDivider = false }: SummaryStatProps) {
  return (
    <View
      testID="rally-summary-stat"
      className={
        hasDivider
          ? "border-border flex-1 items-center gap-0.5 border-l px-1"
          : "flex-1 items-center gap-0.5 px-1"
      }
    >
      <Text className="text-foreground-muted text-xs">{label}</Text>
      <Text className="text-foreground text-center text-sm font-semibold">
        {value}
      </Text>
    </View>
  );
}

const NO_VALUE = "—";

type RallySummaryStatsProps = {
  // null when the rally has no stamps yet.
  summary: RallySummary | null;
};

export function RallySummaryStats({ summary }: RallySummaryStatsProps) {
  const { t } = useTranslation();

  return (
    <View aria-label={t("rallies.summaryLabel")} className="w-full flex-row">
      <SummaryStat
        label={t("rallies.firstStamp")}
        value={summary ? formatMediumDate(summary.firstStampedAt) : NO_VALUE}
      />
      <SummaryStat
        hasDivider
        label={t("rallies.perWeek")}
        value={summary ? summary.perWeek.toFixed(1) : NO_VALUE}
      />
      <SummaryStat
        hasDivider
        label={t("rallies.lastStamp")}
        value={summary ? formatDaysAgo(summary.daysSinceLast) : NO_VALUE}
      />
    </View>
  );
}
