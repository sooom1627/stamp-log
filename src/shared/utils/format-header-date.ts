const monthFormatter = new Intl.DateTimeFormat("en-GB", { month: "long" });

export function formatHeaderDate(date: Date) {
  return `${date.getDate()} ${monthFormatter.format(date)}, ${date.getFullYear()}`;
}
