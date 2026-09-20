import { rallyEmojiSchema, rallyTypeEmojis } from "../rallies";

describe("S-023 T-001 ST-001 rally emoji", () => {
  test.each(["👤", "👨‍👩‍👧‍👦", "🇯🇵", "1️⃣"])("accepts emoji %s", (emoji) => {
    expect(rallyEmojiSchema.parse(emoji)).toBe(emoji);
  });

  test.each(["", "   "])("rejects empty value %p", (value) => {
    expect(rallyEmojiSchema.safeParse(value).success).toBe(false);
  });

  test("has default emoji per type", () => {
    expect(rallyTypeEmojis).toEqual({
      person: "😀",
      place: "🏠",
      action: "👏",
    });
  });
});
