import { buildRallySummary } from "../rally-summary";

const at = (month: number, day: number, hours = 12, minutes = 0) =>
  new Date(2026, month - 1, day, hours, minutes).toISOString();

describe("S-028 ST-001 buildRallySummary", () => {
  const today = new Date(2026, 8, 20, 9, 0);

  test("returns null when the rally has no stamps", () => {
    expect(buildRallySummary([], today)).toBeNull();
  });

  test("averages stamps over the weeks from the first stamp day through today", () => {
    // Aug 3 – Sep 20 is 49 days counting both ends: 7 weeks, 12 / 7 = 1.71…
    const stampDates = [
      at(9, 18),
      at(8, 3),
      ...[5, 7, 10, 14, 17, 21, 24, 28].map((day) => at(8, day)),
      at(9, 2),
      at(9, 9),
    ];

    expect(buildRallySummary(stampDates, today)).toEqual({
      firstStampedAt: new Date(at(8, 3)),
      perWeek: 1.7,
      daysSinceLast: 2,
    });
  });

  test("counts at least one week so a new rally is not inflated", () => {
    const summary = buildRallySummary([at(9, 20, 8), at(9, 19, 22)], today);

    expect(summary?.perWeek).toBe(2);
  });

  test("rounds the weekly average to one decimal place", () => {
    // Sep 1 – Sep 20 is 20 days: 10 / (20 / 7) = 3.5
    const tenStamps = Array.from({ length: 10 }, (_, index) =>
      at(9, 1 + index * 2),
    );
    // Sep 7 – Sep 20 is 14 days: 3 / 2 = 1.5; Aug 31 – Sep 20 is 21 days: 10 / 3 = 3.33…
    const threeStamps = [at(9, 7), at(9, 12), at(9, 19)];
    const tenOverThreeWeeks = [at(8, 31), ...tenStamps.slice(1)];

    expect(buildRallySummary(tenStamps, today)?.perWeek).toBe(3.5);
    expect(buildRallySummary(threeStamps, today)?.perWeek).toBe(1.5);
    expect(buildRallySummary(tenOverThreeWeeks, today)?.perWeek).toBe(3.3);
  });

  test("counts days since the last stamp by local calendar day", () => {
    expect(
      buildRallySummary([at(9, 19, 23, 30)], new Date(2026, 8, 20, 0, 10))
        ?.daysSinceLast,
    ).toBe(1);
    expect(buildRallySummary([at(9, 20, 0, 5)], today)?.daysSinceLast).toBe(0);
  });
});
