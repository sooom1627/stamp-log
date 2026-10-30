import { i18n } from "@/shared/i18n";

import { addLocalDays } from "./add-local-days";
import { localDateKey } from "./local-date-key";

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });

function yearSuffix(date: Date, now: Date) {
  return date.getFullYear() === now.getFullYear()
    ? ""
    : `, ${date.getFullYear()}`;
}

// 24-hour H:mm in every language, whatever the device's 12/24-hour setting.
// Built by hand: Intl's time output varies by ICU version.
export function formatStampTime(date: Date) {
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getHours()}:${minutes}`;
}

// The day line of a rally detail post, e.g. "Fri, Sep 18". Dates stay English
// in every language (docs/design.md 言語).
export function formatStampDay(date: Date, now = new Date()) {
  return `${weekdayFormatter.format(date)}, ${monthFormatter.format(date)} ${date.getDate()}${yearSuffix(date, now)}`;
}

// The heading of a day section in a timeline: Today / Yesterday with the date
// beside it, otherwise the date alone.
export function formatDayHeading(date: Date, now = new Date()) {
  const day = formatStampDay(date, now);
  const dayKey = localDateKey(date);
  if (dayKey === localDateKey(now)) {
    return { title: i18n.t("dates.today"), detail: day };
  }
  if (dayKey === localDateKey(addLocalDays(now, -1))) {
    return { title: i18n.t("dates.yesterday"), detail: day };
  }
  return { title: day };
}

// The date of a stamp without its time, e.g. "Oct 10" (S-037 Album tiles).
export function formatStampDate(date: Date, now = new Date()) {
  return `${monthFormatter.format(date)} ${date.getDate()}${yearSuffix(date, now)}`;
}

export function formatStampDateTime(date: Date, now = new Date()) {
  return `${formatStampDate(date, now)}, ${formatStampTime(date)}`;
}
