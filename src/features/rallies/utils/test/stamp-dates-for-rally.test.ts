import { type Stamp } from "../../schemas/stamps";
import { stampDatesForRally } from "../stamp-dates-for-rally";

const stamp = (id: number, rallyId: number, stampedAt: string): Stamp => ({
  id,
  rallyId,
  stampedAt,
  memo: null,
  photos: [],
});

describe("stampDatesForRally", () => {
  test("returns the stampedAt of the rally's stamps only, in order", () => {
    const stamps = [
      stamp(1, 1, "2026-09-20T03:00:00.000Z"),
      stamp(2, 2, "2026-09-19T03:00:00.000Z"),
      stamp(3, 1, "2026-09-18T03:00:00.000Z"),
    ];

    expect(stampDatesForRally(stamps, 1)).toEqual([
      "2026-09-20T03:00:00.000Z",
      "2026-09-18T03:00:00.000Z",
    ]);
  });

  test("returns an empty list for a rally without stamps", () => {
    expect(
      stampDatesForRally([stamp(1, 2, "2026-09-20T03:00:00.000Z")], 1),
    ).toEqual([]);
  });
});
