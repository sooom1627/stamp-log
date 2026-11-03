// The ISO time `days` days before today at `hours`:00 local time.
export function daysAgoAt(days: number, hours: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
}
