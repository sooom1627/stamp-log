import { stampEmojiRows } from "../stamp-emoji-rows";

describe("S-029 T-001 ST-007 stampEmojiRows", () => {
  test("puts one to three emojis in one row", () => {
    expect(stampEmojiRows(["🏃"])).toEqual({ rows: [["🏃"]], moreCount: 0 });
    expect(stampEmojiRows(["🏃", "📚", "⛩️"])).toEqual({
      rows: [["🏃", "📚", "⛩️"]],
      moreCount: 0,
    });
  });

  test("puts four or five emojis in two rows, three on top", () => {
    expect(stampEmojiRows(["🏃", "📚", "⛩️", "☕", "🗼"])).toEqual({
      rows: [
        ["🏃", "📚", "⛩️"],
        ["☕", "🗼"],
      ],
      moreCount: 0,
    });
  });

  test("shows four emojis and counts the rest when there are more than five", () => {
    expect(stampEmojiRows(["🏃", "📚", "⛩️", "☕", "🗼", "🧘", "🎨"])).toEqual({
      rows: [["🏃", "📚", "⛩️"], ["☕"]],
      moreCount: 3,
    });
  });

  test("returns no rows for no emojis", () => {
    expect(stampEmojiRows([])).toEqual({ rows: [], moreCount: 0 });
  });
});
