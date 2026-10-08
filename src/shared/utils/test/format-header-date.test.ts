import { formatHeaderDate } from "../format-header-date";

describe("S-029 T-001 ST-003 formatHeaderDate", () => {
  test("returns the weekday and the month and day", () => {
    expect(formatHeaderDate(new Date(2026, 8, 20))).toEqual({
      weekday: "Sunday",
      monthDay: "September 20",
    });
  });
});
