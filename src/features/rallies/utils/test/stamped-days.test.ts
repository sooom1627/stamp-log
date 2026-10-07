import { type Rally } from "../../schemas/rallies";
import { type Stamp } from "../../schemas/stamps";
import { buildStampedDays } from "../stamped-days";

const at = (month: number, day: number, hours = 12, minutes = 0) =>
  new Date(2026, month - 1, day, hours, minutes).toISOString();

const rallies: Rally[] = [
  { id: 1, name: "Tokyo towers", type: "place", emoji: "🗼" },
  { id: 2, name: "Morning run", type: "action", emoji: "🏃" },
];

let nextStampId = 1;
const stamp = (rallyId: number, stampedAt: string): Stamp => ({
  id: nextStampId++,
  rallyId,
  stampedAt,
  memo: null,
});

describe("S-029 T-001 ST-001 buildStampedDays", () => {
  const today = new Date(2026, 8, 20, 9, 0);

  test("lists only stamped days of the last 7 days, newest first", () => {
    const stamps = [
      stamp(1, at(9, 14)),
      stamp(1, at(9, 18)),
      stamp(2, at(9, 20, 8)),
    ];

    expect(buildStampedDays(stamps, rallies, today)).toEqual([
      {
        dateKey: "2026-09-20",
        date: new Date(2026, 8, 20),
        isToday: true,
        emojis: ["🏃"],
      },
      {
        dateKey: "2026-09-18",
        date: new Date(2026, 8, 18),
        isToday: false,
        emojis: ["🗼"],
      },
      {
        dateKey: "2026-09-14",
        date: new Date(2026, 8, 14),
        isToday: false,
        emojis: ["🗼"],
      },
    ]);
  });

  test("leaves out stamps 8 days ago or earlier", () => {
    const days = buildStampedDays(
      [stamp(1, at(9, 13, 23, 59))],
      rallies,
      today,
    );

    expect(days.map((day) => day.dateKey)).toEqual(["2026-09-20"]);
  });

  test("groups stamps by local calendar day at the midnight boundary", () => {
    const stamps = [stamp(1, at(9, 18, 23, 59)), stamp(2, at(9, 19, 0, 0))];

    const days = buildStampedDays(stamps, rallies, today);

    expect(days.map((day) => [day.dateKey, day.emojis])).toEqual([
      ["2026-09-20", []],
      ["2026-09-19", ["🏃"]],
      ["2026-09-18", ["🗼"]],
    ]);
  });

  test("keeps today with no emojis when nothing is stamped today", () => {
    expect(buildStampedDays([], rallies, today)).toEqual([
      {
        dateKey: "2026-09-20",
        date: new Date(2026, 8, 20),
        isToday: true,
        emojis: [],
      },
    ]);
  });

  test("puts one emoji per rally on a day, oldest stamp first", () => {
    const stamps = [stamp(1, at(9, 19, 18)), stamp(2, at(9, 19, 7))];

    const [, saturday] = buildStampedDays(stamps, rallies, today);

    expect(saturday.emojis).toEqual(["🏃", "🗼"]);
  });

  test("counts a rally once when it has several stamps on the same day", () => {
    const stamps = [
      stamp(1, at(9, 19, 7)),
      stamp(2, at(9, 19, 9)),
      stamp(1, at(9, 19, 21)),
    ];

    const [, saturday] = buildStampedDays(stamps, rallies, today);

    expect(saturday.emojis).toEqual(["🗼", "🏃"]);
  });

  test("ignores stamps of rallies that are not in the list", () => {
    const days = buildStampedDays([stamp(99, at(9, 19))], rallies, today);

    expect(days.map((day) => day.dateKey)).toEqual(["2026-09-20"]);
  });
});
