import { Pressable, Text } from "react-native";

import { useTranslation } from "react-i18next";

import { ChevronLeft } from "@/shared/components/icons";
import { formatStampCount } from "@/shared/utils/format-stamp-count";
import { formatMonthHeading } from "@/shared/utils/month-grid";

type PreviousMonthButtonProps = {
  // The first day of the month the button moves to.
  month: Date;
  // That month's stamps, shown beside it.
  count: number;
  onPress: () => void;
};

// At the bottom of Logs: turns the calendar and the records below back a month.
export function PreviousMonthButton({
  month,
  count,
  onPress,
}: PreviousMonthButtonProps) {
  const { t } = useTranslation();
  const heading = formatMonthHeading(month);

  return (
    <Pressable
      role="button"
      aria-label={t("records.showPreviousMonth", {
        month: heading,
        stamps: formatStampCount(count),
      })}
      className="min-h-11 flex-row items-center justify-center gap-1 self-center px-4"
      onPress={onPress}
    >
      <ChevronLeft colorClassName="accent-accent" size={18} />
      <Text className="text-foreground-secondary text-sm font-semibold">
        {`${heading} · ${count}`}
      </Text>
    </Pressable>
  );
}
