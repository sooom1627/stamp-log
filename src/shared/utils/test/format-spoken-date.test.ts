import { i18n } from "@/shared/i18n";

import { formatSpokenDate, formatSpokenMonthDay } from "../format-spoken-date";

const date = new Date(2026, 8, 18, 19, 2);

describe("S-045 ST-003 spoken date", () => {
  test("reads the date in English", () => {
    expect(formatSpokenDate(date)).toBe("Sep 18, 2026");
    expect(formatSpokenMonthDay(date)).toBe("Sep 18");
  });

  test("reads the date in Japanese", async () => {
    await i18n.changeLanguage("ja");

    expect(formatSpokenDate(date)).toBe("2026年9月18日");
    expect(formatSpokenMonthDay(date)).toBe("9月18日");
  });
});
