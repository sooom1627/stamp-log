import { type Rally } from "../../schemas/rallies";
import { type Stamp } from "../../schemas/stamps";
import { sortRalliesForHome } from "../sort-rallies-for-home";

const rally = (id: number, isFavorite = false): Rally => ({
  id,
  name: `Rally ${id}`,
  emoji: "🗼",
  isFavorite,
  isArchived: false,
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

describe("S-029 T-003 ST-001 sortRalliesForHome by stamp count", () => {
  test("puts the rally with more stamps first", () => {
    const rallies = [rally(1), rally(2), rally(3)];
    const stamps = [...stampsFor(1, 1), ...stampsFor(2, 3), ...stampsFor(3, 2)];

    expect(idsOf(sortRalliesForHome(rallies, stamps))).toEqual([2, 3, 1]);
  });

  test("puts the newer rally first when the counts are the same", () => {
    const rallies = [rally(1), rally(3), rally(2)];
    const stamps = [...stampsFor(1, 2), ...stampsFor(2, 2), ...stampsFor(3, 2)];

    expect(idsOf(sortRalliesForHome(rallies, stamps))).toEqual([3, 2, 1]);
  });

  test("keeps rallies without stamps, after the stamped ones", () => {
    const rallies = [rally(1), rally(2), rally(3)];

    expect(idsOf(sortRalliesForHome(rallies, stampsFor(1, 1)))).toEqual([
      1, 3, 2,
    ]);
  });

  test("ignores stamps of rallies that are not in the list", () => {
    const rallies = [rally(1), rally(2)];

    expect(idsOf(sortRalliesForHome(rallies, [...stampsFor(99, 5)]))).toEqual([
      2, 1,
    ]);
  });

  test("does not change the given rallies", () => {
    const rallies = [rally(1), rally(2)];

    sortRalliesForHome(rallies, stampsFor(2, 1));

    expect(idsOf(rallies)).toEqual([1, 2]);
  });
});

describe("S-032 T-001 ST-005 sortRalliesForHome with favorites", () => {
  test("puts a favorite with fewer stamps before a non-favorite with more", () => {
    const rallies = [rally(1), rally(2, true)];
    const stamps = [...stampsFor(1, 5), ...stampsFor(2, 1)];

    expect(idsOf(sortRalliesForHome(rallies, stamps))).toEqual([2, 1]);
  });

  test("orders favorites, then non-favorites, each by stamp count", () => {
    const rallies = [
      rally(1),
      rally(2, true),
      rally(3),
      rally(4, true),
      rally(5),
    ];
    const stamps = [
      ...stampsFor(1, 9),
      ...stampsFor(2, 1),
      ...stampsFor(3, 4),
      ...stampsFor(4, 3),
    ];

    expect(idsOf(sortRalliesForHome(rallies, stamps))).toEqual([4, 2, 1, 3, 5]);
  });

  test("puts the newer favorite first when the counts are the same", () => {
    const rallies = [rally(1, true), rally(2, true)];

    expect(idsOf(sortRalliesForHome(rallies, []))).toEqual([2, 1]);
  });

  test("does not change the given rallies", () => {
    const rallies = [rally(1), rally(2, true)];

    sortRalliesForHome(rallies, []);

    expect(idsOf(rallies)).toEqual([1, 2]);
  });
});
