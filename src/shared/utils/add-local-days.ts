// Local midnight `days` after `date`. Built from the local date parts so DST
// changes do not shift the day.
export function addLocalDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}
