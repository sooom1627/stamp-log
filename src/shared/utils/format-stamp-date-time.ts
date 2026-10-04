const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

// Built by hand: Intl's time output varies by ICU version (e.g. a narrow
// no-break space before AM/PM).
export function formatStampTime(date: Date) {
  const hours = date.getHours() % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = date.getHours() < 12 ? "AM" : "PM";
  return `${hours}:${minutes} ${period}`;
}

export function formatStampDateTime(date: Date, now = new Date()) {
  const year =
    date.getFullYear() === now.getFullYear() ? "" : `, ${date.getFullYear()}`;
  return `${monthFormatter.format(date)} ${date.getDate()}${year}, ${formatStampTime(date)}`;
}
