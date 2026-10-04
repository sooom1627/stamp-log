import { localDateKey } from "@/shared/utils/local-date-key";

export type MonthDay = {
  date: Date;
  key: string;
  isRecorded: boolean;
};

const DAYS_PER_WEEK = 7;

// Weeks of the month containing `month`, Monday first. Cells outside the
// month are null so every week has seven columns.
export function buildMonthWeeks(month: Date, stampDates: string[]) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const recordedDateKeys = new Set(
    stampDates.map((stampDate) => localDateKey(new Date(stampDate))),
  );
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
