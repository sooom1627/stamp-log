// Where the dots of a rally image go, in pixels of the 1080 × 1350 image
// (docs/screens/share-image.md ラリーの画像).
const AREA_WIDTH = 808;
const AREA_HEIGHT = 520;
const MAX_CELL = 160;

// Fewer stamps get bigger dots: the fewest columns whose rows still fit the
// area, each cell no larger than MAX_CELL.
export function rallyDotGrid(count: number) {
  for (let columns = 1; ; columns++) {
    const cellSize = Math.min(AREA_WIDTH / columns, MAX_CELL);
    if (Math.ceil(count / columns) * cellSize <= AREA_HEIGHT) {
      return { columns, cellSize };
    }
  }
}
