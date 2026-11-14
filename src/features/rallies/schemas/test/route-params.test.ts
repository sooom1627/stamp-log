import {
  dateParamSchema,
  idParamSchema,
  monthParamSchema,
  pageParamSchema,
  yearParamSchema,
} from "../route-params";

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

describe("S-058 T-003 ST-002 month URL param", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 10, 3, 12));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("parses a month into its first local day", () => {
    expect(monthParamSchema.parse("2026-10")).toEqual(new Date(2026, 9, 1));
  });

  test("accepts this month", () => {
    expect(monthParamSchema.parse("2026-11")).toEqual(new Date(2026, 10, 1));
  });

  test.each([
    ["2026-12"],
    ["2027-01"],
    ["2026-13"],
    ["2026-00"],
    ["2026-1"],
    ["202610"],
    [""],
    [undefined],
    [["2026-10"]],
  ])("rejects %p", (value) => {
    expect(monthParamSchema.safeParse(value).success).toBe(false);
  });
});

describe("S-058 T-004 ST-002 year and page URL params", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 10, 3, 12));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("parses a year up to this one into a number", () => {
    expect(yearParamSchema.parse("2025")).toBe(2025);
    expect(yearParamSchema.parse("2026")).toBe(2026);
  });

  test.each([
    ["2027"],
    ["26"],
    ["02026"],
    ["abc"],
    [""],
    [undefined],
    [["2026"]],
  ])("rejects the year %p", (value) => {
    expect(yearParamSchema.safeParse(value).success).toBe(false);
  });

  test("parses a page from 1 to 4 into a number", () => {
    expect(pageParamSchema.parse("1")).toBe(1);
    expect(pageParamSchema.parse("4")).toBe(4);
  });

  test.each([["0"], ["5"], ["01"], ["1.5"], [""], [undefined]])(
    "rejects the page %p",
    (value) => {
      expect(pageParamSchema.safeParse(value).success).toBe(false);
    },
  );
});
