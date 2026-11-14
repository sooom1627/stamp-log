import { rallyDotGrid } from "../rally-dot-grid";

// Sizes are pixels of the 1080 × 1350 image (docs/screens/share-image.md).
describe("rallyDotGrid", () => {
  test.each([
    [1, 1, 160],
    [5, 2, 160],
    [38, 8, 101],
    [160, 16, 51],
    [420, 27, 30],
  ])(
    "lays %i dots in %i columns of about %i px",
    (count, expectedColumns, expectedCell) => {
      const { columns, cellSize } = rallyDotGrid(count);
      expect(columns).toBe(expectedColumns);
      expect(Math.round(cellSize)).toBe(expectedCell);
    },
  );

  test("fits every count inside the 808 × 520 area", () => {
    for (const count of [1, 2, 7, 38, 99, 160, 420, 1000]) {
      const { columns, cellSize } = rallyDotGrid(count);
      expect(columns * cellSize).toBeLessThanOrEqual(808);
      expect(Math.ceil(count / columns) * cellSize).toBeLessThanOrEqual(520);
    }
  });
});
