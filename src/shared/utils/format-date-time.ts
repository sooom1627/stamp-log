const dateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDateTime(iso: string) {
  return dateTimeFormatter.format(new Date(iso));
}
