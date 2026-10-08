import { countFittingChips } from "../count-fitting-chips";

// Chips 50 wide with a 6 gap; the +N chip is 30 wide.
const fit = (chipCount: number, rowWidth: number) =>
  countFittingChips(Array(chipCount).fill(50), rowWidth, 6, 30);

describe("S-029 T-001 ST-005 countFittingChips", () => {
  test("shows every chip when they all fit", () => {
    // 50 + 6 + 50 + 6 + 50 = 162
    expect(fit(3, 162)).toBe(3);
  });

  test("leaves room for the +N chip when some do not fit", () => {
    // 2 chips + +N: 50 + 6 + 50 + 6 + 30 = 142; 3 chips + +N needs 198
    expect(fit(5, 160)).toBe(2);
  });

  test("shows only +N when not even one chip fits beside it", () => {
    expect(fit(2, 70)).toBe(0);
  });

  test("shows nothing to hide when there are no chips", () => {
    expect(fit(0, 100)).toBe(0);
  });
});
