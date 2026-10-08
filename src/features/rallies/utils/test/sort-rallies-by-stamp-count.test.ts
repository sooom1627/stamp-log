import { type Rally } from "../../schemas/rallies";
import { type Stamp } from "../../schemas/stamps";
import { sortRalliesByStampCount } from "../sort-rallies-by-stamp-count";

const rally = (id: number): Rally => ({
  id,
  name: `Rally ${id}`,
  type: "place",
  emoji: "🗼",
});

let nextStampId = 1;
const stampsFor = (rallyId: number, count: number): Stamp[] =>
  Array.from({ length: count }, () => ({
    id: nextStampId++,
    rallyId,
    stampedAt: new Date(2026, 8, 20).toISOString(),
    memo: null,
  }));

const idsOf = (rallies: Rally[]) => rallies.map((sorted) => sorted.id);

describe("S-029 T-003 ST-001 sortRalliesByStampCount", () => {
  test("puts the rally with more stamps first", () => {
    const rallies = [rally(1), rally(2), rally(3)];
    const stamps = [...stampsFor(1, 1), ...stampsFor(2, 3), ...stampsFor(3, 2)];

    expect(idsOf(sortRalliesByStampCount(rallies, stamps))).toEqual([2, 3, 1]);
  });

  test("puts the newer rally first when the counts are the same", () => {
    const rallies = [rally(1), rally(3), rally(2)];
    const stamps = [...stampsFor(1, 2), ...stampsFor(2, 2), ...stampsFor(3, 2)];

    expect(idsOf(sortRalliesByStampCount(rallies, stamps))).toEqual([3, 2, 1]);
  });

  test("keeps rallies without stamps, after the stamped ones", () => {
    const rallies = [rally(1), rally(2), rally(3)];

    expect(idsOf(sortRalliesByStampCount(rallies, stampsFor(1, 1)))).toEqual([
      1, 3, 2,
    ]);
  });

  test("ignores stamps of rallies that are not in the list", () => {
    const rallies = [rally(1), rally(2)];

    expect(
      idsOf(sortRalliesByStampCount(rallies, [...stampsFor(99, 5)])),
    ).toEqual([2, 1]);
  });

  test("does not change the given rallies", () => {
    const rallies = [rally(1), rally(2)];

    sortRalliesByStampCount(rallies, stampsFor(2, 1));

    expect(idsOf(rallies)).toEqual([1, 2]);
  });
});
