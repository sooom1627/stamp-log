import { formatDateTime } from "../format-date-time";

describe("formatDateTime", () => {
  test("ISO 日時を ja-JP の日付と時刻にする", () => {
    const iso = "2026-09-19T12:34:00.000Z";

    expect(formatDateTime(iso)).toBe(
      new Intl.DateTimeFormat("ja-JP", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(iso)),
    );
  });
});
