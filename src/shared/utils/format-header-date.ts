const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
const monthDayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
});

export function formatHeaderDate(date: Date) {
  return {
    weekday: weekdayFormatter.format(date),
    monthDay: monthDayFormatter.format(date),
  };
}
