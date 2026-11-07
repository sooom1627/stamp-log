import { Pressable, Text } from "react-native";

import { useTranslation } from "react-i18next";

import { ChevronLeft } from "@/shared/components/icons";
import { useMonthStamps } from "@/shared/hooks/use-stamps";
import { formatStampCount } from "@/shared/utils/format-stamp-count";
import { formatMonthHeading } from "@/shared/utils/month-grid";

type PreviousMonthButtonProps = {
  // The first day of the month the button moves to.
  month: Date;
  onPress: () => void;
};

// At the bottom of Logs: turns the calendar and the records below back a
// month. It counts that month's stamps itself, so the list above does not
// render again when the count arrives.
export function PreviousMonthButton({
  month,
  onPress,
}: PreviousMonthButtonProps) {
  const { t } = useTranslation();
  const { data: stamps } = useMonthStamps(month);
  const count = stamps?.length ?? 0;
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
      <ChevronLeft colorClassName="accent-accent" size={16} />
      <Text className="text-foreground-secondary text-subhead font-semibold">
        {`${heading} · ${count}`}
      </Text>
    </Pressable>
  );
}
