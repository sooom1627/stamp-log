const mediumDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

// e.g. "Sep 18, 2026"
export function formatMediumDate(date: Date) {
  return mediumDateFormatter.format(date);
}
