import { Pressable, Text } from "react-native";

import { useTranslation } from "react-i18next";

import { ChevronLeft } from "@/shared/components/icons";
import { formatMonthHeading } from "@/shared/utils/month-grid";

type PreviousMonthButtonProps = {
  // The first day of the month the button moves to.
  month: Date;
  onPress: () => void;
};

// At the bottom of Logs: turns the calendar and the records below back a month.
export function PreviousMonthButton({
  month,
  onPress,
}: PreviousMonthButtonProps) {
  const { t } = useTranslation();
  const heading = formatMonthHeading(month);

  return (
    <Pressable
      role="button"
      aria-label={t("records.showPreviousMonth", { month: heading })}
      className="min-h-11 flex-row items-center justify-center gap-1 self-center px-4"
      onPress={onPress}
    >
      <ChevronLeft colorClassName="accent-accent" size={18} />
      <Text className="text-foreground-secondary text-sm font-semibold">
        {heading}
      </Text>
    </Pressable>
  );
}
