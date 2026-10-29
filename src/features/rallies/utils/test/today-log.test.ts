import { type Rally } from "@/shared/schemas/rallies";
import { type Stamp } from "@/shared/schemas/stamps";

import { buildTodayLog, countDaysWithAto } from "../today-log";

const at = (day: number, hours = 12, minutes = 0) =>
  new Date(2026, 8, day, hours, minutes).toISOString();

const rallies: Rally[] = [
  {
    id: 1,
    name: "Morning run",
    emoji: "🏃",
    isFavorite: false,
    isArchived: false,
  },
  { id: 2, name: "Reading", emoji: "📚", isFavorite: false, isArchived: true },
];

let nextStampId = 1;
const stamp = (rallyId: number, stampedAt: string): Stamp => ({
  id: nextStampId++,
  rallyId,
  stampedAt,
  memo: null,
  photos: [],
});

describe("S-050 ST-002 buildTodayLog", () => {
  const today = new Date(2026, 8, 20, 21, 0);

  test("lists every stamp of today, oldest first, with its emoji and hour", () => {
    const log = buildTodayLog(
      [
        stamp(2, at(20, 19, 6)),
        stamp(1, at(20, 7, 12)),
        stamp(1, at(20, 12, 30)),
      ],
      rallies,
      today,
    );

    expect(log.map((entry) => entry.emoji)).toEqual(["🏃", "🏃", "📚"]);
    expect(log[0].hour).toBeCloseTo(7.2);
    expect(log[2].stampedAt).toEqual(new Date(2026, 8, 20, 19, 6));
  });

  test("leaves out other days and rallies that are not loaded", () => {
    const log = buildTodayLog(
      [stamp(1, at(19, 23, 59)), stamp(9, at(20, 8)), stamp(1, at(21, 0, 1))],
      rallies,
      today,
    );

    expect(log).toEqual([]);
  });
});

describe("S-050 ST-002 countDaysWithAto", () => {
  const today = new Date(2026, 9, 29, 8, 0);

  test("counts the first stamp's local day as day 1", () => {
    expect(
      countDaysWithAto(new Date(2026, 9, 29, 7).toISOString(), today),
    ).toBe(1);
    expect(
      countDaysWithAto(new Date(2026, 3, 3, 23).toISOString(), today),
    ).toBe(210);
  });

  test("is 0 without stamps", () => {
    expect(countDaysWithAto(null, today)).toBe(0);
  });
});
