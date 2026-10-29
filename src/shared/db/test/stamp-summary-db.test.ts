import { loadFreshDb } from "./load-fresh-db";

jest.useFakeTimers();

beforeEach(() => {
  jest.setSystemTime(new Date("2026-09-19T12:34:00.000Z"));
});

describe("RT-003 ST-003 tile summary", () => {
  test("counts every stamp by rally and returns only the stamps since the given time", async () => {
    const { stampsDb, stampSummaryDb } = loadFreshDb();
    const old = "2026-09-01T09:00:00.000Z";
    const since = "2026-09-13T15:00:00.000Z";
    await stampsDb.saveStamp({ rallyId: 1, stampedAt: old });
    const onSince = await stampsDb.saveStamp({ rallyId: 1, stampedAt: since });
    const recent = await stampsDb.saveStamp({ rallyId: 2 });

    const { countsByRally, recentStamps } =
      await stampSummaryDb.getStampSummary(since);

    expect([...countsByRally]).toEqual([
      [1, 2],
      [2, 1],
    ]);
    expect(recentStamps).toEqual([recent, onSince]);
  });

  test("returns no counts and no stamps when nothing is stamped", async () => {
    const { stampSummaryDb } = loadFreshDb();

    const { countsByRally, recentStamps } =
      await stampSummaryDb.getStampSummary("2026-09-13T15:00:00.000Z");

    expect(countsByRally.size).toBe(0);
    expect(recentStamps).toEqual([]);
  });
});

describe("RT-003 ST-004 the first stamp", () => {
  test("getFirstStampedAt returns the oldest stamp's time, and null without stamps", async () => {
    const { stampsDb, stampSummaryDb } = loadFreshDb();
    await expect(stampSummaryDb.getFirstStampedAt()).resolves.toBeNull();

    await stampsDb.saveStamp({ rallyId: 1 });
    const oldest = await stampsDb.saveStamp({
      rallyId: 2,
      stampedAt: "2024-03-01T09:00:00.000Z",
    });

    await expect(stampSummaryDb.getFirstStampedAt()).resolves.toBe(
      oldest.stampedAt,
    );
  });
});
