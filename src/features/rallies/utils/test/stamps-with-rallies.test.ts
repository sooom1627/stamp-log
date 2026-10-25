import { type Rally } from "../../schemas/rallies";
import { type Stamp } from "../../schemas/stamps";
import { stampsWithRallies } from "../stamps-with-rallies";

const rally = (id: number, name: string): Rally => ({
  id,
  name,
  emoji: "🗼",
  isFavorite: false,
  isArchived: false,
});

const stamp = (id: number, rallyId: number): Stamp => ({
  id,
  rallyId,
  stampedAt: "2026-09-20T03:00:00.000Z",
  memo: null,
  photos: [],
});

describe("stampsWithRallies", () => {
  test("pairs each stamp with its rally, keeping the stamps' order", () => {
    const towers = rally(1, "Tokyo towers");
    const run = rally(2, "Morning run");

    expect(
      stampsWithRallies([stamp(3, 2), stamp(2, 1), stamp(1, 2)], [towers, run]),
    ).toEqual([
      { stamp: stamp(3, 2), rally: run },
      { stamp: stamp(2, 1), rally: towers },
      { stamp: stamp(1, 2), rally: run },
    ]);
  });

  test("leaves out stamps whose rally is not loaded", () => {
    expect(
      stampsWithRallies([stamp(1, 9)], [rally(1, "Tokyo towers")]),
    ).toEqual([]);
    expect(stampsWithRallies([stamp(1, 1)], [])).toEqual([]);
  });
});
