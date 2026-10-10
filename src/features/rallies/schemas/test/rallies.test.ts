import {
  defaultRallyEmoji,
  rallyEmojiSchema,
  saveRallyInputSchema,
  updateRallyInputSchema,
} from "../rallies";

describe("S-023 T-001 ST-001 rally emoji", () => {
  test.each(["👤", "👨‍👩‍👧‍👦", "🇯🇵", "1️⃣"])("accepts emoji %s", (emoji) => {
    expect(rallyEmojiSchema.parse(emoji)).toBe(emoji);
  });

  test.each(["", "   "])("rejects empty value %p", (value) => {
    expect(rallyEmojiSchema.safeParse(value).success).toBe(false);
  });

  test("has one default emoji", () => {
    expect(defaultRallyEmoji).toBe("✨");
  });
});

describe("S-040 T-001 ST-002 rally without type", () => {
  test("saves a rally from a name alone", () => {
    expect(saveRallyInputSchema.parse({ name: "Kyoto trip" })).toEqual({
      name: "Kyoto trip",
    });
  });

  test("drops a type passed by old callers", () => {
    expect(
      updateRallyInputSchema.parse({
        id: 1,
        name: "Kyoto trip",
        emoji: "⛩️",
      }),
    ).toEqual({ id: 1, name: "Kyoto trip", emoji: "⛩️" });
  });
});

describe("S-013 T-001 ST-001 update rally input", () => {
  const validInput = { id: 1, name: "Kyoto trip", emoji: "⛩️" };

  test("parses id, name and emoji with the name trimmed", () => {
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

  test("rejects missing id", () => {
    expect(
      updateRallyInputSchema.safeParse({ ...validInput, id: undefined })
        .success,
    ).toBe(false);
  });
});
