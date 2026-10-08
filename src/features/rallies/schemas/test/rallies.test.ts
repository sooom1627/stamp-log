import {
  rallyEmojiSchema,
  rallyTypeEmojis,
  updateRallyInputSchema,
} from "../rallies";

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

describe("S-013 T-001 ST-001 update rally input", () => {
  const validInput = { id: 1, name: "Kyoto trip", type: "place", emoji: "⛩️" };

  test("parses id, name, type and emoji with the name trimmed", () => {
    expect(
      updateRallyInputSchema.parse({ ...validInput, name: "  Kyoto trip  " }),
    ).toEqual(validInput);
  });

  test.each(["", "   "])("rejects empty name %p", (name) => {
    expect(
      updateRallyInputSchema.safeParse({ ...validInput, name }).success,
    ).toBe(false);
  });

  test.each([{ emoji: "" }, { emoji: "   " }, { emoji: undefined }])(
    "rejects missing emoji %p",
    (patch) => {
      expect(
        updateRallyInputSchema.safeParse({ ...validInput, ...patch }).success,
      ).toBe(false);
    },
  );

  test("rejects unknown type", () => {
    expect(
      updateRallyInputSchema.safeParse({ ...validInput, type: "food" }).success,
    ).toBe(false);
  });

  test("rejects missing id", () => {
    expect(
      updateRallyInputSchema.safeParse({ ...validInput, id: undefined })
        .success,
    ).toBe(false);
  });
});
