// How many chips fit in one row of rowWidth. When some do not fit, room is
// kept for a "+N" chip of moreWidth after the ones shown.
export function countFittingChips(
  chipWidths: number[],
  rowWidth: number,
  gap: number,
  moreWidth: number,
) {
  const allWidth =
    chipWidths.reduce((sum, width) => sum + width, 0) +
    gap * Math.max(chipWidths.length - 1, 0);
  if (allWidth <= rowWidth) return chipWidths.length;

  let usedWidth = moreWidth;
  let count = 0;
  for (const width of chipWidths) {
    if (usedWidth + width + gap > rowWidth) break;
    usedWidth += width + gap;
    count += 1;
  }
  return count;
}
