import {
  buildMonthWeeks,
  buildWeek,
  shiftWeek,
  weekHeadingMonth,
} from "../month-grid";

function dayNumbers(weeks: ReturnType<typeof buildMonthWeeks>) {
  return weeks.map((week) => week.map((day) => day?.date.getDate() ?? null));
}

function recordedKeys(weeks: ReturnType<typeof buildMonthWeeks>) {
  return weeks
    .flat()
    .filter((day) => day?.isRecorded)
    .map((day) => day?.key);
}

describe("S-006 ST-001 buildMonthWeeks", () => {
  test("lays out a month that starts on Tuesday from Monday", () => {
    const weeks = buildMonthWeeks(new Date(2026, 8, 1), []);

    expect(dayNumbers(weeks)).toEqual([
      [null, 1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12, 13],
      [14, 15, 16, 17, 18, 19, 20],
      [21, 22, 23, 24, 25, 26, 27],
      [28, 29, 30, null, null, null, null],
    ]);
  });

  test("fits a 28-day month that starts on Monday into four weeks", () => {
    const weeks = buildMonthWeeks(new Date(2027, 1, 1), []);

    expect(dayNumbers(weeks)).toEqual([
      [1, 2, 3, 4, 5, 6, 7],
      [8, 9, 10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19, 20, 21],
      [22, 23, 24, 25, 26, 27, 28],
    ]);
  });

  test("spreads a month that starts on Sunday over six weeks", () => {
    const weeks = buildMonthWeeks(new Date(2026, 10, 1), []);

    expect(dayNumbers(weeks)).toEqual([
      [null, null, null, null, null, null, 1],
      [2, 3, 4, 5, 6, 7, 8],
      [9, 10, 11, 12, 13, 14, 15],
      [16, 17, 18, 19, 20, 21, 22],
      [23, 24, 25, 26, 27, 28, 29],
      [30, null, null, null, null, null, null],
    ]);
  });

  test("uses any day of the month to pick the month", () => {
    expect(dayNumbers(buildMonthWeeks(new Date(2026, 8, 20, 15), []))).toEqual(
      dayNumbers(buildMonthWeeks(new Date(2026, 8, 1), [])),
    );
  });

  test("marks only the local days of this month that have stamps", () => {
    const weeks = buildMonthWeeks(new Date(2026, 8, 1), [
      new Date(2026, 8, 2, 8, 15).toISOString(),
      new Date(2026, 8, 20, 11, 40).toISOString(),
      new Date(2026, 8, 20, 23, 30).toISOString(),
      new Date(2026, 7, 31, 23, 59).toISOString(),
      new Date(2026, 9, 1, 0, 0).toISOString(),
    ]);

    expect(recordedKeys(weeks)).toEqual(["2026-09-02", "2026-09-20"]);
  });
});

function weekKeys(days: ReturnType<typeof buildWeek>) {
  return days.map((day) => day.key);
}

describe("S-028 ST-001 buildWeek", () => {
  test("lays out the Monday-first week that holds the given day", () => {
    expect(weekKeys(buildWeek(new Date(2026, 8, 20, 15), []))).toEqual([
      "2026-09-14",
      "2026-09-15",
      "2026-09-16",
      "2026-09-17",
      "2026-09-18",
      "2026-09-19",
      "2026-09-20",
    ]);
  });

  test("fills every day of a week that crosses a month or a year", () => {
    expect(weekKeys(buildWeek(new Date(2026, 9, 1), []))).toEqual([
      "2026-09-28",
      "2026-09-29",
      "2026-09-30",
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
      "2026-10-04",
    ]);
    expect(weekKeys(buildWeek(new Date(2027, 0, 1), []))).toEqual([
      "2026-12-28",
      "2026-12-29",
      "2026-12-30",
      "2026-12-31",
      "2027-01-01",
      "2027-01-02",
      "2027-01-03",
    ]);
  });

  test("marks only the local days of the week that have stamps", () => {
    const week = buildWeek(new Date(2026, 8, 20), [
      new Date(2026, 8, 14, 0, 5).toISOString(),
      new Date(2026, 8, 18, 23, 30).toISOString(),
      new Date(2026, 8, 13, 23, 59).toISOString(),
      new Date(2026, 8, 21, 0, 0).toISOString(),
    ]);

    expect(week.filter((day) => day.isRecorded).map((day) => day.key)).toEqual([
      "2026-09-14",
      "2026-09-18",
    ]);
  });
});

describe("S-028 ST-001 shiftWeek", () => {
  test("moves the day by whole weeks", () => {
    expect(shiftWeek(new Date(2026, 8, 20), 1)).toEqual(new Date(2026, 8, 27));
    expect(shiftWeek(new Date(2026, 8, 20), -1)).toEqual(new Date(2026, 8, 13));
    expect(shiftWeek(new Date(2026, 11, 28), 1)).toEqual(new Date(2027, 0, 4));
  });
});

describe("S-028 ST-002 weekHeadingMonth", () => {
  const september = new Date(2026, 8, 1);
  const october = new Date(2026, 9, 1);
  const weekOf = (month: number, day: number) =>
    buildWeek(new Date(2026, month - 1, day), []);

  test("keeps the heading month while the week still has one of its days", () => {
    expect(weekHeadingMonth(september, weekOf(9, 28))).toEqual(september);
    expect(weekHeadingMonth(october, weekOf(9, 28))).toEqual(october);
  });

  test("moves to the week's month once no day of the heading month is left", () => {
    expect(weekHeadingMonth(september, weekOf(10, 5))).toEqual(october);
    expect(weekHeadingMonth(october, weekOf(9, 21))).toEqual(september);
  });

  test("uses the first day of the month for any day passed as the heading", () => {
    expect(weekHeadingMonth(new Date(2026, 8, 20, 15), weekOf(9, 28))).toEqual(
      september,
    );
  });
});
