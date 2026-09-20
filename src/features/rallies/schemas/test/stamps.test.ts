import {
  parseStampRow,
  saveStampInputSchema,
  stampSchema,
  updateStampMemoInputSchema,
} from "../stamps";

describe("ST-001 stamp schema", () => {
  test("parses a valid stamp", () => {
    const stamp = {
      id: 1,
      rallyId: 2,
      stampedAt: "2026-09-19T12:34:00.000Z",
      memo: null,
    };

    expect(stampSchema.parse(stamp)).toEqual(stamp);
  });

  test("rejects when stampedAt is not a datetime", () => {
    expect(() =>
      stampSchema.parse({
        id: 1,
        rallyId: 2,
        stampedAt: "not-a-datetime",
      }),
    ).toThrow();
  });

  test("save input accepts rallyId only and rejects when missing", () => {
    expect(saveStampInputSchema.parse({ rallyId: 3 })).toEqual({ rallyId: 3 });
    expect(() => saveStampInputSchema.parse({})).toThrow();
  });

  test("parses native SQLite lowercase column names", () => {
    expect(
      parseStampRow({
        id: 1,
        rallyid: 2,
        stampedat: "2026-09-19T12:34:00.000Z",
      }),
    ).toEqual({
      id: 1,
      rallyId: 2,
      stampedAt: "2026-09-19T12:34:00.000Z",
      memo: null,
    });
  });

  test("parses string id and rallyId", () => {
    expect(
      parseStampRow({
        id: "1",
        rallyId: "2",
        stampedAt: "2026-09-19T12:34:00.000Z",
      }),
    ).toEqual({
      id: 1,
      rallyId: 2,
      stampedAt: "2026-09-19T12:34:00.000Z",
      memo: null,
    });
  });
});

describe("ST-002 optional stamp memo", () => {
  test("parses stamp with memo", () => {
    const stamp = {
      id: 1,
      rallyId: 2,
      stampedAt: "2026-09-19T12:34:00.000Z",
      memo: "Met them",
    };

    expect(stampSchema.parse(stamp)).toEqual(stamp);
  });

  test("parses stamp with null memo", () => {
    const stamp = {
      id: 1,
      rallyId: 2,
      stampedAt: "2026-09-19T12:34:00.000Z",
      memo: null,
    };

    expect(stampSchema.parse(stamp)).toEqual(stamp);
  });

  test("parseStampRow sets memo to null when column is missing", () => {
    expect(
      parseStampRow({
        id: 1,
        rallyId: 2,
        stampedAt: "2026-09-19T12:34:00.000Z",
      }),
    ).toEqual({
      id: 1,
      rallyId: 2,
      stampedAt: "2026-09-19T12:34:00.000Z",
      memo: null,
    });
  });

  test("update input accepts id and memo and rejects empty values", () => {
    expect(
      updateStampMemoInputSchema.parse({ id: 1, memo: "Met them" }),
    ).toEqual({ id: 1, memo: "Met them" });
    expect(() =>
      updateStampMemoInputSchema.parse({ id: 1, memo: "" }),
    ).toThrow();
    expect(() =>
      updateStampMemoInputSchema.parse({ id: 1, memo: "   " }),
    ).toThrow();
  });
});
