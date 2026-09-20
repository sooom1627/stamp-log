import { formatHeaderDate } from "../format-header-date";

describe("S-019 ST-001 formatHeaderDate", () => {
  test("日付を 26 May, 2026 形式にする", () => {
    expect(formatHeaderDate(new Date(2026, 4, 26))).toBe("26 May, 2026");
  });
});
