import {
  defaultRallyEmoji,
  rallyEmojiSchema,
  rallySchema,
  saveRallyInputSchema,
  setRallyArchivedInputSchema,
  setRallyFavoriteInputSchema,
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

describe("S-032 T-001 ST-002 favorite rally", () => {
  const rally = { id: 1, name: "Kyoto trip", emoji: "⛩️" };

  test("reads a rally without isFavorite as not a favorite", () => {
    expect(rallySchema.parse(rally)).toMatchObject({
      ...rally,
      isFavorite: false,
    });
  });

  test("rejects a non-boolean isFavorite", () => {
    expect(rallySchema.safeParse({ ...rally, isFavorite: 1 }).success).toBe(
      false,
    );
  });

  test("parses a rally with isFavorite", () => {
    expect(rallySchema.parse({ ...rally, isFavorite: true })).toMatchObject({
      ...rally,
      isFavorite: true,
    });
  });

  test("leaves isFavorite out of the edit input", () => {
    expect(
      updateRallyInputSchema.parse({ ...rally, isFavorite: true }),
    ).toEqual(rally);
  });

  test("needs an id and a boolean to set a favorite", () => {
    expect(
      setRallyFavoriteInputSchema.parse({ id: 1, isFavorite: true }),
    ).toEqual({ id: 1, isFavorite: true });
    expect(setRallyFavoriteInputSchema.safeParse({ id: 1 }).success).toBe(
      false,
    );
    expect(
      setRallyFavoriteInputSchema.safeParse({ isFavorite: false }).success,
    ).toBe(false);
  });
});

describe("S-039 T-002 ST-001 archived rally", () => {
  const rally = { id: 1, name: "Kyoto trip", emoji: "⛩️" };

  test("reads a rally without isArchived as not archived", () => {
    expect(rallySchema.parse(rally)).toEqual({
      ...rally,
      isFavorite: false,
      isArchived: false,
    });
  });

  test("rejects a non-boolean isArchived", () => {
    expect(rallySchema.safeParse({ ...rally, isArchived: 1 }).success).toBe(
      false,
    );
  });

  test("parses an archived rally", () => {
    expect(rallySchema.parse({ ...rally, isArchived: true })).toMatchObject({
      isArchived: true,
    });
  });

  test("leaves isArchived out of the edit input", () => {
    expect(
      updateRallyInputSchema.parse({ ...rally, isArchived: true }),
    ).toEqual(rally);
  });

  test("needs an id and a boolean to archive", () => {
    expect(
      setRallyArchivedInputSchema.parse({ id: 1, isArchived: true }),
    ).toEqual({ id: 1, isArchived: true });
    expect(setRallyArchivedInputSchema.safeParse({ id: 1 }).success).toBe(
      false,
    );
    expect(
      setRallyArchivedInputSchema.safeParse({ isArchived: false }).success,
    ).toBe(false);
  });
});
