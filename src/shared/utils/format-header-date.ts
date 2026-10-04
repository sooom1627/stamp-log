const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long" });

export function formatHeaderDate(date: Date) {
  return `${date.getDate()} ${monthFormatter.format(date)}, ${date.getFullYear()}`;
}
