import {
  formatDayHeading,
  formatStampDateTime,
  formatStampDay,
  formatStampTime,
} from "../format-stamp-date-time";

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

describe("S-028 ST-003 stamp time", () => {
  test.each([
    [new Date(2026, 8, 18, 19, 2), "7:02 PM"],
    [new Date(2026, 8, 18, 0, 5), "12:05 AM"],
    [new Date(2026, 8, 18, 12, 0), "12:00 PM"],
  ])("%s -> %s", (date, expected) => {
    expect(formatStampTime(date)).toBe(expected);
  });
});

describe("S-028 ST-002 stamp day", () => {
  const now = new Date(2026, 9, 4);

  test.each([
    [new Date(2026, 8, 18, 19, 2), "Fri, Sep 18"],
    [new Date(2026, 8, 2, 8, 0), "Wed, Sep 2"],
    [new Date(2025, 8, 18, 9, 0), "Thu, Sep 18, 2025"],
  ])("%s -> %s", (date, expected) => {
    expect(formatStampDay(date, now)).toBe(expected);
  });
});

describe("S-011 RT-001 ST-002 day heading", () => {
  const today = new Date(2026, 9, 10, 9);

  test("calls today Today with the date beside it", () => {
    expect(formatDayHeading(new Date(2026, 9, 10, 23), today)).toEqual({
      title: "Today",
      detail: "Sat, Oct 10",
    });
  });

  test("calls yesterday Yesterday with the date beside it", () => {
    expect(formatDayHeading(new Date(2026, 9, 9, 0, 5), today)).toEqual({
      title: "Yesterday",
      detail: "Fri, Oct 9",
    });
  });

  test("shows an older day as its date only", () => {
    expect(formatDayHeading(new Date(2026, 9, 8, 12), today)).toEqual({
      title: "Thu, Oct 8",
    });
  });

  test("adds the year for a day from another year", () => {
    expect(formatDayHeading(new Date(2025, 9, 8, 12), today)).toEqual({
      title: "Wed, Oct 8, 2025",
    });
  });

  test("counts yesterday across a month boundary", () => {
    expect(
      formatDayHeading(new Date(2026, 8, 30, 22), new Date(2026, 9, 1, 1)),
    ).toEqual({ title: "Yesterday", detail: "Wed, Sep 30" });
  });
});
