import { buildMonthWeeks } from "../month-grid";

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
