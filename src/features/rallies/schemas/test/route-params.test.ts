import { idParamSchema } from "../route-params";

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
