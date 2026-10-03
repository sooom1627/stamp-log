import {
  hasStampOnLocalDay,
  notFutureDatetimeSchema,
  saveStampInputSchema,
  stampSchema,
  updateStampInputSchema,
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

describe("S-025 ST-001 past stamp save input", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-19T12:34:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("accepts a past stampedAt", () => {
    expect(
      saveStampInputSchema.parse({
        rallyId: 3,
        stampedAt: "2026-09-18T11:40:00.000Z",
      }),
    ).toEqual({ rallyId: 3, stampedAt: "2026-09-18T11:40:00.000Z" });
  });

  test("accepts stampedAt equal to now", () => {
    expect(
      saveStampInputSchema.parse({
        rallyId: 3,
        stampedAt: "2026-09-19T12:34:00.000Z",
      }),
    ).toEqual({ rallyId: 3, stampedAt: "2026-09-19T12:34:00.000Z" });
  });

  test("rejects a future stampedAt", () => {
    expect(() =>
      saveStampInputSchema.parse({
        rallyId: 3,
        stampedAt: "2026-09-19T12:35:00.000Z",
      }),
    ).toThrow();
  });

  test("rejects stampedAt that is not an ISO datetime", () => {
    expect(() =>
      saveStampInputSchema.parse({ rallyId: 3, stampedAt: "yesterday" }),
    ).toThrow();
  });
});

describe("S-006 ST-004 stamp update input", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-19T12:34:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("accepts a past stampedAt and trims the memo", () => {
    expect(
      updateStampInputSchema.parse({
        id: 1,
        stampedAt: "2026-09-18T11:40:00.000Z",
        memo: "  Met them  ",
      }),
    ).toEqual({
      id: 1,
      stampedAt: "2026-09-18T11:40:00.000Z",
      memo: "Met them",
    });
  });

  test("accepts stampedAt equal to now", () => {
    expect(
      updateStampInputSchema.parse({
        id: 1,
        stampedAt: "2026-09-19T12:34:00.000Z",
        memo: "Met them",
      }).stampedAt,
    ).toBe("2026-09-19T12:34:00.000Z");
  });

  test("rejects a future stampedAt", () => {
    expect(
      updateStampInputSchema.safeParse({
        id: 1,
        stampedAt: "2026-09-19T12:35:00.000Z",
        memo: "Met them",
      }).success,
    ).toBe(false);
  });

  test("rejects stampedAt that is not an ISO datetime", () => {
    expect(
      updateStampInputSchema.safeParse({
        id: 1,
        stampedAt: "yesterday",
        memo: "Met them",
      }).success,
    ).toBe(false);
  });

  test("turns an empty or blank memo into null", () => {
    for (const memo of ["", "   "]) {
      expect(
        updateStampInputSchema.parse({
          id: 1,
          stampedAt: "2026-09-18T11:40:00.000Z",
          memo,
        }).memo,
      ).toBeNull();
    }
  });

  test("rejects when id is missing", () => {
    expect(
      updateStampInputSchema.safeParse({
        stampedAt: "2026-09-18T11:40:00.000Z",
        memo: "Met them",
      }).success,
    ).toBe(false);
  });
});

describe("S-006 RT-002 ST-001 not-future datetime", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-19T12:34:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("accepts a past datetime and now", () => {
    for (const value of [
      "2026-09-18T11:40:00.000Z",
      "2026-09-19T12:34:00.000Z",
    ]) {
      expect(notFutureDatetimeSchema.parse(value)).toBe(value);
    }
  });

  test("rejects a future datetime and a non-ISO value", () => {
    for (const value of ["2026-09-19T12:35:00.000Z", "yesterday"]) {
      expect(notFutureDatetimeSchema.safeParse(value).success).toBe(false);
    }
  });
});

describe("S-006 RT-002 ST-002 same local day rule", () => {
  const stamps = [
    {
      id: 1,
      rallyId: 10,
      stampedAt: new Date(2026, 8, 18, 9, 0).toISOString(),
    },
    {
      id: 2,
      rallyId: 20,
      stampedAt: new Date(2026, 8, 19, 9, 0).toISOString(),
    },
  ];

  test("is true when the same rally has a stamp on that local day", () => {
    expect(
      hasStampOnLocalDay(stamps, {
        rallyId: 10,
        date: new Date(2026, 8, 18, 23, 59),
      }),
    ).toBe(true);
  });

  test("is false for another day or another rally", () => {
    expect(
      hasStampOnLocalDay(stamps, {
        rallyId: 10,
        date: new Date(2026, 8, 19, 0, 0),
      }),
    ).toBe(false);
    expect(
      hasStampOnLocalDay(stamps, {
        rallyId: 30,
        date: new Date(2026, 8, 18, 9, 0),
      }),
    ).toBe(false);
  });

  test("does not count the excluded stamp itself", () => {
    expect(
      hasStampOnLocalDay(stamps, {
        rallyId: 10,
        date: new Date(2026, 8, 18, 12, 0),
        excludedId: 1,
      }),
    ).toBe(false);
  });
});
