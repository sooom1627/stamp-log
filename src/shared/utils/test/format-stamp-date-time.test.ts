import { i18n } from "@/shared/i18n";

import {
  formatDayHeading,
  formatStampDate,
  formatStampDateTime,
  formatStampDay,
  formatStampTime,
} from "../format-stamp-date-time";

const now = new Date(2026, 9, 1);

describe("S-006 ST-001 formatStampDateTime", () => {
  test("formats a stamp from this year as Sep 20, 11:40", () => {
    expect(formatStampDateTime(new Date(2026, 8, 20, 11, 40), now)).toBe(
      "Sep 20, 11:40",
    );
  });

  test("adds the year for a stamp from another year", () => {
    expect(formatStampDateTime(new Date(2025, 8, 20, 11, 40), now)).toBe(
      "Sep 20, 2025, 11:40",
    );
  });

  test("keeps the English date in Japanese (S-045 ST-003)", async () => {
    await i18n.changeLanguage("ja");

    expect(formatStampDateTime(new Date(2026, 8, 20, 19, 2), now)).toBe(
      "Sep 20, 19:02",
    );
  });
});

describe("S-045 ST-003 stamp time in 24 hours", () => {
  test.each([
    [new Date(2026, 8, 18, 19, 2), "19:02"],
    [new Date(2026, 8, 18, 0, 5), "0:05"],
    [new Date(2026, 8, 18, 9, 5), "9:05"],
    [new Date(2026, 8, 18, 12, 0), "12:00"],
    [new Date(2026, 8, 18, 23, 40), "23:40"],
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

  test("calls today and yesterday 今日 and 昨日 in Japanese (S-045 ST-003)", async () => {
    await i18n.changeLanguage("ja");

    expect(formatDayHeading(new Date(2026, 9, 10, 23), today)).toEqual({
      title: "今日",
      detail: "Sat, Oct 10",
    });
    expect(formatDayHeading(new Date(2026, 9, 9, 0, 5), today)).toEqual({
      title: "昨日",
      detail: "Fri, Oct 9",
    });
    expect(formatDayHeading(new Date(2026, 9, 8, 12), today)).toEqual({
      title: "Thu, Oct 8",
    });
  });

  test("counts yesterday across a month boundary", () => {
    expect(
      formatDayHeading(new Date(2026, 8, 30, 22), new Date(2026, 9, 1, 1)),
    ).toEqual({ title: "Yesterday", detail: "Wed, Sep 30" });
  });
});

describe("S-037 T-003 ST-004 formatStampDate", () => {
  test("formats a day of this year as Oct 10, without the time", () => {
    expect(formatStampDate(new Date(2026, 9, 10, 20, 15), now)).toBe("Oct 10");
  });

  test("adds the year for a day of another year", () => {
    expect(formatStampDate(new Date(2025, 9, 10, 8), now)).toBe("Oct 10, 2025");
  });
});
