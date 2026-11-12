import { type Rally } from "@/shared/schemas/rallies";
import { type Stamp } from "@/shared/schemas/stamps";

import { buildMonthShare } from "../month-share-grid";

const october = new Date(2026, 9, 1);

function rally(id: number, name = `Rally ${id}`): Rally {
  return { id, name, emoji: "☕", isFavorite: false, isArchived: false };
}

let nextStampId = 1;
// A stamp of `rallyId` on the given October day at `hours`:00 local time.
function stampOn(rallyId: number, day: number, hours = 12): Stamp {
  return {
    id: nextStampId++,
    rallyId,
    stampedAt: new Date(2026, 9, day, hours).toISOString(),
    memo: null,
    photos: [],
  };
}

describe("S-058 T-003 ST-003 month share grid", () => {
  test("gives each stamped rally its stamped days, most stamped first", () => {
    const cafe = rally(1);
    const books = rally(2);
    const share = buildMonthShare(
      october,
      [stampOn(1, 3), stampOn(2, 5), stampOn(2, 9), stampOn(2, 20)],
      [cafe, books],
    );

    expect(share.daysInMonth).toBe(31);
    expect(share.stampCount).toBe(4);
    expect(share.rallyCount).toBe(2);
    expect(share.rows.map((row) => row.rally)).toEqual([books, cafe]);
    expect([...share.rows[0].days].sort((a, b) => a - b)).toEqual([5, 9, 20]);
    expect(share.rows[0].count).toBe(3);
    expect(share.rest).toBeNull();
  });

  test("keeps the given (home tile) order for the same count and leaves out unstamped rallies", () => {
    const share = buildMonthShare(
      october,
      [stampOn(3, 1), stampOn(1, 2)],
      [rally(3), rally(2), rally(1)],
    );

    expect(share.rows.map((row) => row.rally.id)).toEqual([3, 1]);
  });

  test("marks only the month's last stamp as the newest", () => {
    const share = buildMonthShare(
      october,
      [stampOn(1, 31, 9), stampOn(2, 31, 21), stampOn(1, 4)],
      [rally(1), rally(2)],
    );

    expect(share.latest).toEqual({ rallyId: 2, day: 31 });
  });

  test("draws a day stamped twice as one cell but counts both stamps", () => {
    const share = buildMonthShare(
      october,
      [stampOn(1, 7, 8), stampOn(1, 7, 20)],
      [rally(1)],
    );

    expect([...share.rows[0].days]).toEqual([7]);
    expect(share.rows[0].count).toBe(2);
    expect(share.stampCount).toBe(2);
  });

  test("with 7 or more rallies, keeps 5 rows and sums up the rest", () => {
    const rallies = [1, 2, 3, 4, 5, 6, 7].map((id) => rally(id));
    const stamps = [
      ...[1, 2, 3, 4].map((day) => stampOn(1, day)),
      ...[1, 2, 3].map((day) => stampOn(2, day)),
      ...[1, 2].map((day) => stampOn(3, day)),
      stampOn(4, 1),
      stampOn(5, 1),
      stampOn(6, 1),
      ...[1, 2].map((day) => stampOn(7, day + 10)),
    ];

    const share = buildMonthShare(october, stamps, rallies);

    expect(share.rows.map((row) => row.rally.id)).toEqual([1, 2, 3, 7, 4]);
    expect(share.rest).toEqual({ rallyCount: 2, stampCount: 2 });
    expect(share.rallyCount).toBe(7);
  });

  test("keeps 6 rows when exactly 6 rallies were stamped", () => {
    const rallies = [1, 2, 3, 4, 5, 6].map((id) => rally(id));
    const share = buildMonthShare(
      october,
      rallies.map(({ id }) => stampOn(id, id)),
      rallies,
    );

    expect(share.rows).toHaveLength(6);
    expect(share.rest).toBeNull();
  });

  test("skips stamps of a rally that is no longer there", () => {
    const share = buildMonthShare(
      october,
      [stampOn(1, 1), stampOn(99, 2)],
      [rally(1)],
    );

    expect(share.stampCount).toBe(1);
    expect(share.latest).toEqual({ rallyId: 1, day: 1 });
  });
});
