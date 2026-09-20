import {
  parseStampRow,
  saveStampInputSchema,
  stampSchema,
  updateStampMemoInputSchema,
} from "../stamps";

describe("ST-001 stamps の型", () => {
  test("正当な stamp を parse できる", () => {
    const stamp = {
      id: 1,
      rallyId: 2,
      stampedAt: "2026-09-19T12:34:00.000Z",
      memo: null,
    };

    expect(stampSchema.parse(stamp)).toEqual(stamp);
  });

  test("stampedAt が日時でないと reject する", () => {
    expect(() =>
      stampSchema.parse({
        id: 1,
        rallyId: 2,
        stampedAt: "not-a-datetime",
      }),
    ).toThrow();
  });

  test("save 入力は rallyId だけ通し、欠けると reject する", () => {
    expect(saveStampInputSchema.parse({ rallyId: 3 })).toEqual({ rallyId: 3 });
    expect(() => saveStampInputSchema.parse({})).toThrow();
  });

  test("ネイティブ SQLite の小文字カラム名も stamp にできる", () => {
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

  test("id と rallyId が文字列でも stamp にできる", () => {
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

describe("ST-002 stamp の任意 memo", () => {
  test("memo 付き stamp を parse できる", () => {
    const stamp = {
      id: 1,
      rallyId: 2,
      stampedAt: "2026-09-19T12:34:00.000Z",
      memo: "会った",
    };

    expect(stampSchema.parse(stamp)).toEqual(stamp);
  });

  test("memo が null の stamp を parse できる", () => {
    const stamp = {
      id: 1,
      rallyId: 2,
      stampedAt: "2026-09-19T12:34:00.000Z",
      memo: null,
    };

    expect(stampSchema.parse(stamp)).toEqual(stamp);
  });

  test("parseStampRow で memo が無い行は null になる", () => {
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

  test("update 入力は id と memo を通し、空や空白のみは reject する", () => {
    expect(updateStampMemoInputSchema.parse({ id: 1, memo: "会った" })).toEqual(
      { id: 1, memo: "会った" },
    );
    expect(() =>
      updateStampMemoInputSchema.parse({ id: 1, memo: "" }),
    ).toThrow();
    expect(() =>
      updateStampMemoInputSchema.parse({ id: 1, memo: "   " }),
    ).toThrow();
  });
});
