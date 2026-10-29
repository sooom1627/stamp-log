import { type Stamp } from "@/shared/schemas/stamps";

import { stampDatesByRally } from "../stamp-dates-by-rally";

const stamp = (id: number, rallyId: number, stampedAt: string): Stamp => ({
  id,
  rallyId,
  stampedAt,
  memo: null,
  photos: [],
});

describe("stampDatesByRally", () => {
  test("groups each rally's stampedAt, in order", () => {
    const stamps = [
      stamp(1, 1, "2026-09-20T03:00:00.000Z"),
      stamp(2, 2, "2026-09-19T03:00:00.000Z"),
      stamp(3, 1, "2026-09-18T03:00:00.000Z"),
    ];

    const datesByRally = stampDatesByRally(stamps);

    expect(datesByRally.get(1)).toEqual([
      "2026-09-20T03:00:00.000Z",
      "2026-09-18T03:00:00.000Z",
    ]);
    expect(datesByRally.get(2)).toEqual(["2026-09-19T03:00:00.000Z"]);
  });

  test("has no entry for a rally without stamps", () => {
    expect(
      stampDatesByRally([stamp(1, 2, "2026-09-20T03:00:00.000Z")]).has(1),
    ).toBe(false);
  });
});
