import { type Stamp } from "@/shared/schemas/stamps";

import { lookBackYears, yearReviewYear } from "../look-back";

let nextStampId = 1;
function stampAt(date: Date): Stamp {
  return {
    id: nextStampId++,
    rallyId: 1,
    stampedAt: date.toISOString(),
    memo: null,
    photos: [],
  };
}

describe("S-058 T-004 ST-003 look back", () => {
  test("lists the years and months with stamps, newest first, with their counts", () => {
    const years = lookBackYears([
      stampAt(new Date(2025, 11, 31, 23)),
      stampAt(new Date(2026, 9, 3, 9)),
      stampAt(new Date(2026, 9, 31, 20)),
      stampAt(new Date(2026, 10, 1, 0, 30)),
    ]);

    expect(years).toEqual([
      {
        year: 2026,
        months: [
          { month: new Date(2026, 10, 1), stampCount: 1 },
          { month: new Date(2026, 9, 1), stampCount: 2 },
        ],
      },
      { year: 2025, months: [{ month: new Date(2025, 11, 1), stampCount: 1 }] },
    ]);
  });

  test("without stamps, lists nothing", () => {
    expect(lookBackYears([])).toEqual([]);
  });

  test.each([
    [new Date(2026, 10, 30), null],
    [new Date(2026, 11, 1), 2026],
    [new Date(2026, 11, 31), 2026],
    [new Date(2027, 0, 1), 2026],
    [new Date(2027, 0, 31), 2026],
    [new Date(2027, 1, 1), null],
  ])("on %s the Logs entry shows the year %p", (today, year) => {
    expect(yearReviewYear(today)).toBe(year);
  });
});
