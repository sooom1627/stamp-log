import { rallyEmojiSchema, rallyTypeEmojis } from "../rallies";

describe("S-023 T-001 ST-001 ラリー絵文字", () => {
  test.each(["👤", "👨‍👩‍👧‍👦", "🇯🇵", "1️⃣"])("絵文字 %s を受け入れる", (emoji) => {
    expect(rallyEmojiSchema.parse(emoji)).toBe(emoji);
  });

  test.each(["", "   "])("空の値 %p を拒否する", (value) => {
    expect(rallyEmojiSchema.safeParse(value).success).toBe(false);
  });

  test("タイプごとの初期絵文字がある", () => {
    expect(rallyTypeEmojis).toEqual({
      person: "😀",
      place: "🏠",
      action: "👏",
    });
  });
});
