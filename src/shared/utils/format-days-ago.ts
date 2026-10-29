import { i18n } from "@/shared/i18n";

export function formatDaysAgo(days: number) {
  if (days === 0) return i18n.t("dates.today");
  return i18n.t(days === 1 ? "dates.dayAgo" : "dates.daysAgo", { days });
}
