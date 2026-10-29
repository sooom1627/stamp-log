import { i18n } from "@/shared/i18n";

import { formatDaysAgo } from "../format-days-ago";

describe("S-028 ST-002 days ago", () => {
  test.each([
    [0, "Today"],
    [1, "1 day ago"],
    [2, "2 days ago"],
    [45, "45 days ago"],
  ])("%i -> %s", (days, expected) => {
    expect(formatDaysAgo(days)).toBe(expected);
  });
});

describe("S-045 ST-003 days ago in Japanese", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("ja");
  });

  test.each([
    [0, "今日"],
    [1, "1 日前"],
    [45, "45 日前"],
  ])("%i -> %s", (days, expected) => {
    expect(formatDaysAgo(days)).toBe(expected);
  });
});
