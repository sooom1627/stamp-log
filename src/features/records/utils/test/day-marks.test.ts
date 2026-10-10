import { type Rally } from "@/features/rallies/schemas/rallies";
import { type Stamp } from "@/features/rallies/schemas/stamps";

import { buildDayMarks } from "../day-marks";

const at = (day: number, hours = 12, minutes = 0) =>
  new Date(2026, 9, day, hours, minutes).toISOString();

const rallies: Rally[] = [
  { id: 1, name: "Researchers", emoji: "🔬" },
  { id: 2, name: "Weekend runs", emoji: "🏃" },
  { id: 3, name: "Cafes", emoji: "☕" },
];

let nextStampId = 1;
const stamp = (rallyId: number, stampedAt: string): Stamp => ({
  id: nextStampId++,
  rallyId,
  stampedAt,
  memo: null,
});

describe("S-011 T-001 ST-001 buildDayMarks", () => {
  test("shows the rally emoji and no extra count on a day with one stamp", () => {
    const marks = buildDayMarks([stamp(1, at(8, 19))], rallies);

    expect(marks.get("2026-10-08")).toEqual({ emoji: "🔬", extraCount: 0 });
    expect(marks.size).toBe(1);
  });

  test("shows the last stamped rally and the other stamps as the extra count", () => {
    const marks = buildDayMarks(
      [stamp(2, at(7, 6)), stamp(3, at(7, 18)), stamp(1, at(7, 9))],
      rallies,
    );

    expect(marks.get("2026-10-07")).toEqual({ emoji: "☕", extraCount: 2 });
  });

  test("splits days at local midnight", () => {
    const marks = buildDayMarks(
      [stamp(1, at(5, 23, 59)), stamp(2, at(6, 0, 0))],
      rallies,
    );

    expect(marks.get("2026-10-05")).toEqual({ emoji: "🔬", extraCount: 0 });
    expect(marks.get("2026-10-06")).toEqual({ emoji: "🏃", extraCount: 0 });
  });

  test("takes the newer stamp when two share the same time", () => {
    const first = stamp(1, at(4, 10));
    const second = stamp(3, at(4, 10));

    expect(buildDayMarks([second, first], rallies).get("2026-10-04")).toEqual({
      emoji: "☕",
      extraCount: 1,
    });
  });

  test("leaves out stamps whose rally is not loaded", () => {
    const marks = buildDayMarks([stamp(99, at(3))], rallies);

    expect(marks.size).toBe(0);
  });
});
