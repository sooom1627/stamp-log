import { Pressable, Text } from "react-native";

import { Link } from "expo-router";

import { useTranslation } from "react-i18next";

import { AtoMark } from "@/shared/components/ato-mark";
import { ChevronRight } from "@/shared/components/icons";
import { useStampsBetween } from "@/shared/hooks/use-stamps";

type YearReviewEntryProps = {
  year: number;
};

// Logs' entry to the year review, at the year's end (S-058 T-004). Shown only
// once the year is known to have stamps.
export function YearReviewEntry({ year }: YearReviewEntryProps) {
  const { t } = useTranslation();
  const { data: stamps } = useStampsBetween(
    new Date(year, 0, 1),
    new Date(year + 1, 0, 1),
  );
  if (!stamps?.length) return null;

  const label = t("share.yearReview", { year });
  return (
    <Link href={{ pathname: "/year-review", params: { year } }} asChild>
      <Pressable
        role="link"
        aria-label={label}
        className="bg-surface border-continuous rounded-card mb-4 min-h-13 flex-row items-center gap-3 px-4 py-3 active:opacity-70"
      >
        <AtoMark size={20} />
        <Text className="text-foreground text-subhead flex-1 font-semibold">
          {label}
        </Text>
        <ChevronRight size={16} colorClassName="accent-foreground-muted" />
      </Pressable>
    </Link>
  );
}
