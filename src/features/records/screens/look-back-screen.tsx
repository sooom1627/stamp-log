import { Fragment, type ReactNode } from "react";

import { Pressable, Text, View } from "react-native";

import { Link, type Href } from "expo-router";

import { useTranslation } from "react-i18next";

import { AtoMark } from "@/shared/components/ato-mark";
import { FormSheetLayout } from "@/shared/components/form-sheet";
import { ChevronRight } from "@/shared/components/icons";
import { LoadError } from "@/shared/components/load-error";
import { useStamps } from "@/shared/hooks/use-stamps";
import { formatStampCount } from "@/shared/utils/format-stamp-count";
import { localDateKey } from "@/shared/utils/local-date-key";

import { lookBackYears } from "../utils/look-back";

// Month names stay English in Japanese too, like Logs' month heading.
const monthNameFormatter = new Intl.DateTimeFormat("en-US", { month: "long" });

function LookBackRow({
  href,
  label,
  children,
}: {
  href: Href;
  label: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} asChild>
      <Pressable
        role="link"
        aria-label={label}
        className="active:bg-surface-muted-active min-h-13 flex-row items-center gap-3 px-4 py-3"
      >
        {children}
        <ChevronRight size={16} colorClassName="accent-foreground-muted" />
      </Pressable>
    </Link>
  );
}

// Every year and month with stamps, so the year review and the month images
// open at any time (docs/screens/look-back.md).
export function LookBackScreen() {
  const { t } = useTranslation();
  const {
    data: stamps,
    isError: isStampsError,
    refetch: refetchStamps,
  } = useStamps();
  const years = lookBackYears(stamps ?? []);

  return (
    <FormSheetLayout
      testID="look-back-sheet"
      title={t("settings.lookBack")}
      className="gap-6"
      scrollable
    >
      {isStampsError ? (
        <LoadError onRetry={() => void refetchStamps()} />
      ) : null}
      {years.map(({ year, months }) => (
        <View key={year} testID="look-back-year" className="gap-2">
          <Text role="heading" className="text-foreground text-headline px-4">
            {year}
          </Text>
          <View className="border-continuous bg-surface-muted overflow-hidden rounded-2xl">
            <LookBackRow
              href={{ pathname: "/year-review", params: { year } }}
              label={t("share.yearReview", { year })}
            >
              <AtoMark size={20} />
              <Text className="text-foreground text-body flex-1">
                {t("share.yearReview", { year })}
              </Text>
            </LookBackRow>
            {months.map(({ month, stampCount }) => {
              const monthName = monthNameFormatter.format(month);
              const stampsText = formatStampCount(stampCount);
              return (
                <Fragment key={month.getMonth()}>
                  {/* The sheet color shows through as the divider (as Settings). */}
                  <View className="bg-background ml-4 h-px" />
                  <LookBackRow
                    href={{
                      pathname: "/share-month",
                      params: { month: localDateKey(month).slice(0, 7) },
                    }}
                    label={`${monthName}, ${stampsText}`}
                  >
                    <Text className="text-foreground text-body flex-1">
                      {monthName}
                    </Text>
                    <Text className="text-foreground-muted text-footnote">
                      {stampsText}
                    </Text>
                  </LookBackRow>
                </Fragment>
              );
            })}
          </View>
        </View>
      ))}
    </FormSheetLayout>
  );
}
