import { addLocalDays } from "./add-local-days";
import { localDateKey, localDateKeyFromIso } from "./local-date-key";

export type MonthDay = {
  date: Date;
  key: string;
  isRecorded: boolean;
};

// What a recorded day shows when stamps come from several rallies (Logs):
// the emoji of the day's last stamp, and how many other stamps the day has.
export type DayMark = {
  emoji: string;
  extraCount: number;
};

const DAYS_PER_WEEK = 7;

function toRecordedDateKeys(stampDates: string[]) {
  return new Set(stampDates.map((stampDate) => localDateKeyFromIso(stampDate)));
}

// Weeks of the month containing `month`, Monday first. Cells outside the
// month are null so every week has seven columns.
export function buildMonthWeeks(month: Date, stampDates: string[]) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const recordedDateKeys = toRecordedDateKeys(stampDates);
  const leadingBlanks = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const days: (MonthDay | null)[] = Array.from(
    { length: leadingBlanks },
    () => null,
  );
  for (let dayOfMonth = 1; dayOfMonth <= daysInMonth; dayOfMonth++) {
    const date = new Date(year, monthIndex, dayOfMonth);
    const key = localDateKey(date);
    days.push({ date, key, isRecorded: recordedDateKeys.has(key) });
  }
  while (days.length % DAYS_PER_WEEK !== 0) {
    days.push(null);
  }

  return Array.from({ length: days.length / DAYS_PER_WEEK }, (_, week) =>
    days.slice(week * DAYS_PER_WEEK, (week + 1) * DAYS_PER_WEEK),
  );
}

// The 7 days ending today, oldest first.
export function buildLastDays(stampDates: string[], today: Date): MonthDay[] {
  const recordedDateKeys = toRecordedDateKeys(stampDates);

  return Array.from({ length: DAYS_PER_WEEK }, (_, index) => {
    const date = addLocalDays(today, index - (DAYS_PER_WEEK - 1));
    const key = localDateKey(date);
    return { date, key, isRecorded: recordedDateKeys.has(key) };
  });
}

// Local midnights; `end` is the day after the last shown day.
export type CalendarRange = { start: Date; end: Date };

// The first local day of this month, where the calendar opens.
export function currentMonth() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
}

// All of `month` (its first day) as local midnights.
export function monthRange(month: Date): CalendarRange {
  return {
    start: month,
    end: new Date(month.getFullYear(), month.getMonth() + 1, 1),
  };
}

const monthHeadingFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

// The calendar's heading for a month, e.g. "October 2026".
export function formatMonthHeading(month: Date) {
  return monthHeadingFormatter.format(month);
}

// From the first stamp's year (or this year) to next year, always including
// the shown month's year so the wheel can select it.
export function pickerYears(stampDates: string[], shownMonth: Date) {
  const thisYear = new Date().getFullYear();
  const stampYears = stampDates.map((stampDate) =>
    new Date(stampDate).getFullYear(),
  );
  const from = Math.min(thisYear, shownMonth.getFullYear(), ...stampYears);
  const to = Math.max(thisYear + 1, shownMonth.getFullYear());
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}
