import { formatStampDateTime } from "../format-stamp-date-time";

const now = new Date(2026, 9, 1);

describe("S-006 ST-001 formatStampDateTime", () => {
  test("formats a stamp from this year as Sep 20, 11:40 AM", () => {
    expect(formatStampDateTime(new Date(2026, 8, 20, 11, 40), now)).toBe(
      "Sep 20, 11:40 AM",
    );
  });

  test("uses 12-hour time with PM and two-digit minutes", () => {
    expect(formatStampDateTime(new Date(2026, 8, 18, 19, 2), now)).toBe(
      "Sep 18, 7:02 PM",
    );
  });

  test("shows midnight as 12 AM and noon as 12 PM", () => {
    expect(formatStampDateTime(new Date(2026, 8, 2, 0, 5), now)).toBe(
      "Sep 2, 12:05 AM",
    );
    expect(formatStampDateTime(new Date(2026, 8, 2, 12, 0), now)).toBe(
      "Sep 2, 12:00 PM",
    );
  });

  test("adds the year for a stamp from another year", () => {
    expect(formatStampDateTime(new Date(2025, 8, 20, 11, 40), now)).toBe(
      "Sep 20, 2025, 11:40 AM",
    );
  });
});
