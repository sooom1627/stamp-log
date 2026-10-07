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

const emojisByDateKey = (stamps: Stamp[], today: Date) =>
  Object.fromEntries(
    buildStampedDays(stamps, rallies, today).map((day) => [
      day.dateKey,
      day.emojis,
    ]),
  );

describe("S-029 T-001 ST-001 buildStampedDays", () => {
  const today = new Date(2026, 8, 20, 9, 0);

  test("lists every day of the last 14 days, today first", () => {
    const days = buildStampedDays([stamp(1, at(9, 18))], rallies, today);

    expect(days).toHaveLength(14);
    expect(days[0]).toEqual({
      dateKey: "2026-09-20",
      date: new Date(2026, 8, 20),
      isToday: true,
      emojis: [],
    });
    expect(days[2]).toEqual({
      dateKey: "2026-09-18",
      date: new Date(2026, 8, 18),
      isToday: false,
      emojis: ["🗼"],
    });
    expect(days.at(-1)?.dateKey).toBe("2026-09-07");
    expect(days.filter((day) => day.isToday)).toHaveLength(1);
  });

  test("keeps days without stamps with no emojis", () => {
    const days = buildStampedDays([], rallies, today);

    expect(days.every((day) => day.emojis.length === 0)).toBe(true);
  });

  test("leaves out stamps 14 days ago or earlier", () => {
    const emojis = emojisByDateKey([stamp(1, at(9, 6, 23, 59))], today);

    expect(emojis["2026-09-06"]).toBeUndefined();
    expect(Object.values(emojis).flat()).toEqual([]);
  });

  test("groups stamps by local calendar day at the midnight boundary", () => {
    const emojis = emojisByDateKey(
      [stamp(1, at(9, 18, 23, 59)), stamp(2, at(9, 19, 0, 0))],
      today,
    );

    expect(emojis["2026-09-18"]).toEqual(["🗼"]);
    expect(emojis["2026-09-19"]).toEqual(["🏃"]);
  });

  test("puts one emoji per rally on a day, oldest stamp first", () => {
    const emojis = emojisByDateKey(
      [stamp(1, at(9, 19, 18)), stamp(2, at(9, 19, 7))],
      today,
    );

    expect(emojis["2026-09-19"]).toEqual(["🏃", "🗼"]);
  });

  test("counts a rally once when it has several stamps on the same day", () => {
    const emojis = emojisByDateKey(
      [stamp(1, at(9, 19, 7)), stamp(2, at(9, 19, 9)), stamp(1, at(9, 19, 21))],
      today,
    );

    expect(emojis["2026-09-19"]).toEqual(["🗼", "🏃"]);
  });

  test("ignores stamps of rallies that are not in the list", () => {
    const emojis = emojisByDateKey([stamp(99, at(9, 19))], today);

    expect(emojis["2026-09-19"]).toEqual([]);
  });
});
