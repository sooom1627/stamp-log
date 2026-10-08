const ROW_SIZE = 3;
const MAX_EMOJIS = 5;

// Today's emojis laid out in the stamp: one row of up to three, then a second
// row. Past five, four show and the rest are counted as "+N".
export function stampEmojiRows(emojis: string[]) {
  const shownCount =
    emojis.length > MAX_EMOJIS ? MAX_EMOJIS - 1 : emojis.length;
  const shown = emojis.slice(0, shownCount);
  const rows = [shown.slice(0, ROW_SIZE), shown.slice(ROW_SIZE)].filter(
    (row) => row.length > 0,
  );
  return { rows, moreCount: emojis.length - shownCount };
}
