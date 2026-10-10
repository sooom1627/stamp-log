const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });

function yearSuffix(date: Date, now: Date) {
  return date.getFullYear() === now.getFullYear()
    ? ""
    : `, ${date.getFullYear()}`;
}

// Built by hand: Intl's time output varies by ICU version (e.g. a narrow
// no-break space before AM/PM).
export function formatStampTime(date: Date) {
  const hours = date.getHours() % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = date.getHours() < 12 ? "AM" : "PM";
  return `${hours}:${minutes} ${period}`;
}

// The day line of a rally detail post, e.g. "Fri, Sep 18".
export function formatStampDay(date: Date, now = new Date()) {
  return `${weekdayFormatter.format(date)}, ${monthFormatter.format(date)} ${date.getDate()}${yearSuffix(date, now)}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// The heading of a day section in a timeline: Today / Yesterday with the date
// beside it, otherwise the date alone.
export function formatDayHeading(date: Date, now = new Date()) {
  const day = formatStampDay(date, now);
  if (isSameDay(date, now)) return { title: "Today", detail: day };
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1,
  );
  if (isSameDay(date, yesterday)) return { title: "Yesterday", detail: day };
  return { title: day };
}

export function formatStampDateTime(date: Date, now = new Date()) {
  return `${monthFormatter.format(date)} ${date.getDate()}${yearSuffix(date, now)}, ${formatStampTime(date)}`;
}
