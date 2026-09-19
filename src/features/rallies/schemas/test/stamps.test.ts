import { parseStampRow, saveStampInputSchema, stampSchema } from "../stamps";

describe("ST-001 stamps の型", () => {
  test("正当な stamp を parse できる", () => {
    const stamp = {
      id: 1,
      rallyId: 2,
      stampedAt: "2026-09-19T12:34:00.000Z",
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
    });
  });
});
