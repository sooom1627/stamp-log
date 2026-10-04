import { Text, View } from "react-native";

import { formatDaysAgo } from "@/shared/utils/format-days-ago";

import { type RallySummary } from "../utils/rally-summary";

const firstStampFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center gap-1">
      <Text className="text-foreground text-base font-semibold">{value}</Text>
      <Text className="text-foreground-muted text-xs">{label}</Text>
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
    <View aria-label="Rally summary" className="w-full flex-row pt-2">
      <SummaryStat
        label="First stamp"
        value={
          summary
            ? firstStampFormatter.format(summary.firstStampedAt)
            : NO_VALUE
        }
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
