import { addLocalDays } from "../add-local-days";

describe("addLocalDays", () => {
  test("returns local midnight of the shifted day", () => {
    expect(addLocalDays(new Date(2026, 8, 18, 15, 30), 2)).toEqual(
      new Date(2026, 8, 20),
    );
  });

  test("goes back with a negative number of days", () => {
    expect(addLocalDays(new Date(2026, 8, 18, 9), -1)).toEqual(
      new Date(2026, 8, 17),
    );
  });

  test("crosses month and year ends", () => {
    expect(addLocalDays(new Date(2026, 8, 30), 1)).toEqual(
      new Date(2026, 9, 1),
    );
    expect(addLocalDays(new Date(2027, 0, 1), -1)).toEqual(
      new Date(2026, 11, 31),
    );
  });
});
