import { formatMediumDate } from "@/shared/utils/format-medium-date";
import { localDateKey } from "@/shared/utils/local-date-key";

const monthDayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

// The days a rally image covers, e.g. "Mar 2 – Oct 25, 2026". Dates stay
// English in every language (docs/ia.md 言語).
export function formatDateSpan(first: Date, last: Date) {
  if (localDateKey(first) === localDateKey(last)) return formatMediumDate(last);
  const start =
    first.getFullYear() === last.getFullYear()
      ? monthDayFormatter.format(first)
      : formatMediumDate(first);
  return `${start} – ${formatMediumDate(last)}`;
}
