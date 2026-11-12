import { formatDateSpan } from "../format-date-span";

describe("formatDateSpan", () => {
  test("names the year once when both days are in the same year", () => {
    expect(
      formatDateSpan(new Date(2026, 2, 2, 9), new Date(2026, 9, 25, 21)),
    ).toBe("Mar 2 – Oct 25, 2026");
  });

  test("names both years when the days are in different years", () => {
    expect(formatDateSpan(new Date(2025, 3, 3), new Date(2026, 9, 31))).toBe(
      "Apr 3, 2025 – Oct 31, 2026",
    );
  });

  test("shows one date when the first and last stamp share a day", () => {
    expect(
      formatDateSpan(new Date(2026, 9, 25, 8), new Date(2026, 9, 25, 20)),
    ).toBe("Oct 25, 2026");
  });
});
