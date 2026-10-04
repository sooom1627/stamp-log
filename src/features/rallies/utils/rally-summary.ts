export type RallySummary = {
  firstStampedAt: Date;
  perWeek: number;
  daysSinceLast: number;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Day number of the local calendar date, so hours and DST shifts do not count.
function localDayNumber(date: Date) {
  return (
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY
  );
}

export function buildRallySummary(
  stampDates: string[],
  today: Date,
): RallySummary | null {
  if (stampDates.length === 0) return null;

  const times = stampDates.map((stampDate) => Date.parse(stampDate));
  const firstStampedAt = new Date(Math.min(...times));
  const lastStampedAt = new Date(Math.max(...times));
  const todayDay = localDayNumber(today);

  // Count both the first stamp day and today; never less than one week.
  const daysSinceFirst = todayDay - localDayNumber(firstStampedAt) + 1;
  const weeks = Math.max(1, daysSinceFirst / 7);

  return {
    firstStampedAt,
    perWeek: Math.round((stampDates.length / weeks) * 10) / 10,
    daysSinceLast: todayDay - localDayNumber(lastStampedAt),
  };
}
