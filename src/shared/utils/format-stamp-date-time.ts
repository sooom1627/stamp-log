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

export function formatStampDateTime(date: Date, now = new Date()) {
  return `${monthFormatter.format(date)} ${date.getDate()}${yearSuffix(date, now)}, ${formatStampTime(date)}`;
}
