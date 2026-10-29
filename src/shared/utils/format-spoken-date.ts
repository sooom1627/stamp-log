import { i18n } from "@/shared/i18n";

// Dates read out by VoiceOver follow the app language, unlike the dates on
// screen, which stay English (docs/design.md 言語).
const spokenDateFormatters = {
  en: new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }),
  ja: new Intl.DateTimeFormat("ja-JP", { dateStyle: "long" }),
};
const spokenMonthDayFormatters = {
  en: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }),
  ja: new Intl.DateTimeFormat("ja-JP", { month: "long", day: "numeric" }),
};

function appLanguage() {
  return i18n.language === "ja" ? "ja" : "en";
}

// e.g. "Sep 18, 2026" / "2026年9月18日"
export function formatSpokenDate(date: Date) {
  return spokenDateFormatters[appLanguage()].format(date);
}

// e.g. "Sep 18" / "9月18日"
export function formatSpokenMonthDay(date: Date) {
  return spokenMonthDayFormatters[appLanguage()].format(date);
}
