export function formatDaysAgo(days: number) {
  if (days === 0) return "Today";
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}
