import { localDateKey } from "../local-date-key";

describe("S-025 ST-002 localDateKey", () => {
  test("formats the local calendar day as YYYY-MM-DD", () => {
    expect(localDateKey(new Date(2026, 8, 8, 23, 59))).toBe("2026-09-08");
  });

  test("returns the same key for different times on the same local day", () => {
    expect(localDateKey(new Date(2026, 8, 18, 0, 0))).toBe(
      localDateKey(new Date(2026, 8, 18, 23, 59)),
    );
  });
});
