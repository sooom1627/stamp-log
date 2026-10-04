import { dateParamSchema, idParamSchema } from "../route-params";

describe("S-006 RT-003 ST-001 id URL param", () => {
  test("parses a positive integer string into a number", () => {
    expect(idParamSchema.parse("12")).toBe(12);
  });

  test.each([
    ["abc"],
    ["0"],
    ["-1"],
    ["1.5"],
    [" 1"],
    ["1e2"],
    [""],
    [undefined],
    [["1"]],
  ])("rejects %p", (value) => {
    expect(idParamSchema.safeParse(value).success).toBe(false);
  });
});

describe("S-028 ST-001 date URL param", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 8, 20, 12));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("parses a calendar date into local midnight", () => {
    expect(dateParamSchema.parse("2026-09-18")).toEqual(new Date(2026, 8, 18));
  });

  test("accepts today", () => {
    expect(dateParamSchema.parse("2026-09-20")).toEqual(new Date(2026, 8, 20));
  });

  test.each([
    ["2026-02-30"],
    ["2026-13-01"],
    ["2026-9-1"],
    ["2026-09-21"],
    ["20260918"],
    [""],
    [undefined],
    [["2026-09-18"]],
  ])("rejects %p", (value) => {
    expect(dateParamSchema.safeParse(value).success).toBe(false);
  });
});
