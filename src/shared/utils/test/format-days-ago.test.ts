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
