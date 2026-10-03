const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

export function formatStampDateTime(date: Date, now = new Date()) {
  const year =
    date.getFullYear() === now.getFullYear() ? "" : `, ${date.getFullYear()}`;
  const hours = date.getHours() % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = date.getHours() < 12 ? "AM" : "PM";
  return `${monthFormatter.format(date)} ${date.getDate()}${year}, ${hours}:${minutes} ${period}`;
}
