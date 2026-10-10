import { type Rally } from "../../schemas/rallies";
import { type Stamp } from "../../schemas/stamps";
import { buildTodayStampedRallies } from "../today-stamped-rallies";

const at = (day: number, hours = 12, minutes = 0) =>
  new Date(2026, 8, day, hours, minutes).toISOString();

const rallies: Rally[] = [
  {
    id: 1,
    name: "Tokyo towers",
    emoji: "🗼",
    isFavorite: false,
    isArchived: false,
  },
  {
    id: 2,
    name: "Morning run",
    emoji: "🏃",
    isFavorite: false,
    isArchived: false,
  },
  { id: 3, name: "Reading", emoji: "📚", isFavorite: false, isArchived: false },
];

let nextStampId = 1;
const stamp = (rallyId: number, stampedAt: string): Stamp => ({
  id: nextStampId++,
  rallyId,
  stampedAt,
  memo: null,
});

const namesOf = (stamps: Stamp[]) =>
  buildTodayStampedRallies(stamps, rallies, new Date(2026, 8, 20, 9, 0)).map(
    (rally) => rally.name,
  );

describe("S-029 T-001 ST-004 buildTodayStampedRallies", () => {
  test("lists rallies stamped today, first stamped first", () => {
    expect(
      namesOf([stamp(1, at(20, 18)), stamp(2, at(20, 7)), stamp(3, at(19))]),
    ).toEqual(["Morning run", "Tokyo towers"]);
  });

  test("lists a rally once when it was stamped several times today", () => {
    expect(
      namesOf([stamp(1, at(20, 7)), stamp(2, at(20, 9)), stamp(1, at(20, 21))]),
    ).toEqual(["Tokyo towers", "Morning run"]);
  });

  test("uses the local calendar day at the midnight boundary", () => {
    expect(namesOf([stamp(1, at(19, 23, 59)), stamp(2, at(20, 0, 0))])).toEqual(
      ["Morning run"],
    );
  });

  test("ignores stamps of rallies that are not in the list", () => {
    expect(namesOf([stamp(99, at(20))])).toEqual([]);
  });

  test("returns nothing when nothing was stamped today", () => {
    expect(namesOf([])).toEqual([]);
  });
});
