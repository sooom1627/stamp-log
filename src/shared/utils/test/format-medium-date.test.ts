import { formatMediumDate } from "../format-medium-date";

describe("formatMediumDate", () => {
  test("formats the date with its year, e.g. Sep 18, 2026", () => {
    expect(formatMediumDate(new Date(2026, 8, 18, 15, 30))).toBe(
      "Sep 18, 2026",
    );
  });
});
