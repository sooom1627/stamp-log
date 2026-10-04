import { formatStampCount } from "../format-stamp-count";

describe("S-006 RT-005 ST-005 stamp count", () => {
  test.each([
    [0, "0 stamps"],
    [1, "1 stamp"],
    [2, "2 stamps"],
  ])("%i -> %s", (count, expected) => {
    expect(formatStampCount(count)).toBe(expected);
  });
});
