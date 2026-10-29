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

// The Monday-first week holding `anchor`. Unlike a month row it has no blanks:
// days from the next or previous month fill it.
export function buildWeek(anchor: Date, stampDates: string[]): MonthDay[] {
  const recordedDateKeys = toRecordedDateKeys(stampDates);
  const mondayOffset = (anchor.getDay() + 6) % 7;

  return Array.from({ length: DAYS_PER_WEEK }, (_, index) => {
    const date = addLocalDays(anchor, index - mondayOffset);
    const key = localDateKey(date);
    return { date, key, isRecorded: recordedDateKeys.has(key) };
  });
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

export function shiftWeek(anchor: Date, delta: number) {
  return addLocalDays(anchor, delta * DAYS_PER_WEEK);
}

// Keep the heading month while the shown week still has one of its days, so
// stepping across a month boundary does not flip the heading back and forth.
export function weekHeadingMonth(currentMonth: Date, weekDays: MonthDay[]) {
  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const keepsMonth = weekDays.some(
    ({ date }) => date.getFullYear() === year && date.getMonth() === monthIndex,
  );
  const month = keepsMonth ? currentMonth : weekDays[0].date;
  return new Date(month.getFullYear(), month.getMonth(), 1);
}

// Local midnights; `end` is the day after the last shown day.
export type CalendarRange = { start: Date; end: Date };

// What the calendar shows: a week around `weekAnchor`, or all of `month`.
export type CalendarView = {
  isMonthView: boolean;
  month: Date;
  weekAnchor: Date;
};

function firstDayOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Opens on the week holding today every time; the view is not remembered.
export function initialCalendarView(): CalendarView {
  const today = new Date();
  return {
    isMonthView: false,
    month: firstDayOfMonth(today),
    weekAnchor: today,
  };
}

export function visibleCalendarRange({
  isMonthView,
  month,
  weekAnchor,
}: CalendarView): CalendarRange {
  if (isMonthView) {
    return {
      start: month,
      end: new Date(month.getFullYear(), month.getMonth() + 1, 1),
    };
  }
  const [monday] = buildWeek(weekAnchor, []);
  return { start: monday.date, end: addLocalDays(monday.date, DAYS_PER_WEEK) };
}

// The range the calendar shows when it opens.
export function initialCalendarRange() {
  return visibleCalendarRange(initialCalendarView());
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
