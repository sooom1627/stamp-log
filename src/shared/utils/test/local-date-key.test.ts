import { localDateKey, localDateKeyFromIso } from "../local-date-key";

describe("S-025 ST-002 localDateKey", () => {
  test("formats the local calendar day as YYYY-MM-DD", () => {
    expect(localDateKey(new Date(2026, 8, 8, 23, 59))).toBe("2026-09-08");
  });

  test("returns the same key for different times on the same local day", () => {
    expect(localDateKey(new Date(2026, 8, 18, 0, 0))).toBe(
      localDateKey(new Date(2026, 8, 18, 23, 59)),
    );
  });
});

describe("S-029 RT-001 ST-001 localDateKeyFromIso", () => {
  test("keys a stamp by its local day, not the UTC day", () => {
    const lateNight = new Date(2026, 8, 8, 23, 59).toISOString();
    const earlyMorning = new Date(2026, 8, 9, 0, 1).toISOString();

    expect(localDateKeyFromIso(lateNight)).toBe("2026-09-08");
    expect(localDateKeyFromIso(earlyMorning)).toBe("2026-09-09");
  });

  test("returns the same key for different times on the same local day", () => {
    expect(localDateKeyFromIso(new Date(2026, 8, 18, 0, 0).toISOString())).toBe(
      localDateKeyFromIso(new Date(2026, 8, 18, 23, 59).toISOString()),
    );
  });
});
