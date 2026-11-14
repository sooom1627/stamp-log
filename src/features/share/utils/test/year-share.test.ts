import { type Rally } from "@/shared/schemas/rallies";
import { type Stamp } from "@/shared/schemas/stamps";

import { buildYearShare } from "../year-share";

function rally(id: number): Rally {
  return {
    id,
    name: `Rally ${id}`,
    emoji: "☕",
    isFavorite: false,
    isArchived: false,
  };
}

let nextStampId = 1;
// A stamp of `rallyId` on a 2026 day (month 1–12) at noon local time.
function stampOn(rallyId: number, month: number, day: number): Stamp {
  return {
    id: nextStampId++,
    rallyId,
    stampedAt: new Date(2026, month - 1, day, 12).toISOString(),
    memo: null,
    photos: [],
  };
}

describe("S-058 T-004 ST-003 year share", () => {
  test("counts the year and gives each rally its stamped months, most stamped first", () => {
    const cafe = rally(1);
    const books = rally(2);
    const share = buildYearShare(
      [
        stampOn(1, 3, 2),
        stampOn(2, 1, 5),
        stampOn(2, 1, 9),
        stampOn(2, 10, 20),
      ],
      [cafe, books],
    );

    expect(share.stampCount).toBe(4);
    expect(share.rallyCount).toBe(2);
    expect(share.rows.map((row) => row.rally)).toEqual([books, cafe]);
    expect([...share.rows[0].months].sort((a, b) => a - b)).toEqual([1, 10]);
    expect(share.rows[0].count).toBe(3);
    expect(share.rest).toBeNull();
    // Oct 20 is the year's last stamp: its month is the orange cell.
    expect(share.latest).toEqual({ rallyId: 2, month: 10 });
    expect(share.first).toEqual({
      rally: books,
      stampedAt: new Date(2026, 0, 5, 12).toISOString(),
    });
    expect(share.last).toEqual({
      rally: books,
      stampedAt: new Date(2026, 9, 20, 12).toISOString(),
    });
  });

  test("leaves out the stamps of rallies not given (turned off in the sheet)", () => {
    const share = buildYearShare(
      [stampOn(1, 3, 2), stampOn(2, 11, 1)],
      [rally(1)],
    );

    expect(share.stampCount).toBe(1);
    expect(share.rows).toHaveLength(1);
    expect(share.latest).toEqual({ rallyId: 1, month: 3 });
    expect(share.last?.rally.id).toBe(1);
  });

  test("with 7 or more rallies, keeps 5 rows and sums the rest into one line", () => {
    const rallies = [1, 2, 3, 4, 5, 6, 7].map(rally);
    const stamps = rallies.flatMap((each) =>
      Array.from({ length: 8 - each.id }, (_, index) =>
        stampOn(each.id, 1, index + 1),
      ),
    );

    const share = buildYearShare(stamps, rallies);

    expect(share.rows.map((row) => row.rally.id)).toEqual([1, 2, 3, 4, 5]);
    // Rally 6 has 2 stamps and rally 7 has 1.
    expect(share.rest).toEqual({ rallyCount: 2, stampCount: 3 });
    expect(share.rallyCount).toBe(7);
  });

  test("without stamps, has nothing to show", () => {
    const share = buildYearShare([], [rally(1)]);

    expect(share.stampCount).toBe(0);
    expect(share.rows).toEqual([]);
    expect(share.first).toBeNull();
    expect(share.last).toBeNull();
    expect(share.latest).toBeNull();
  });
});
