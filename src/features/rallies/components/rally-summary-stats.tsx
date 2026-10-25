import { Text, View } from "react-native";

import { formatDaysAgo } from "@/shared/utils/format-days-ago";
import { formatMediumDate } from "@/shared/utils/format-medium-date";

import { type RallySummary } from "../utils/rally-summary";

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View
      testID="rally-summary-tile"
      className="bg-background border-continuous flex-1 items-center gap-0.5 rounded-2xl px-2 py-3"
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
  return (
    <View aria-label="Rally summary" className="mt-3 w-full flex-row gap-2">
      <SummaryStat
        label="First stamp"
        value={summary ? formatMediumDate(summary.firstStampedAt) : NO_VALUE}
      />
      <SummaryStat
        label="Per week"
        value={summary ? summary.perWeek.toFixed(1) : NO_VALUE}
      />
      <SummaryStat
        label="Last stamp"
        value={summary ? formatDaysAgo(summary.daysSinceLast) : NO_VALUE}
      />
    </View>
  );
}
