import { getDb } from "@/shared/db/get-db";

import {
  deleteStamp,
  listStamps,
  saveStamp,
  updateStamp,
  updateStampMemo,
} from "../stamps-db";

jest.useFakeTimers();

beforeEach(() => {
  jest.setSystemTime(new Date("2026-09-19T12:34:00.000Z"));
});

describe("ST-002 stamps SQLite", () => {
  test("returns saved stamp with rallyId and ISO stampedAt", async () => {
    const saved = await saveStamp({ rallyId: 1 });
    expect(saved).toMatchObject({
      rallyId: 1,
      stampedAt: "2026-09-19T12:34:00.000Z",
    });
    expect(saved.id).toEqual(expect.any(Number));

    const [latest] = await listStamps();
    expect(latest).toEqual(saved);
  });

  test("lists newest stamp first after two saves", async () => {
    await saveStamp({ rallyId: 10 });
    await saveStamp({ rallyId: 11 });

    const [first, second] = await listStamps();
    expect(first.rallyId).toBe(11);
    expect(second.rallyId).toBe(10);
  });

  test("supports save and list on legacy stamps table without rallyId column", async () => {
    const db = await getDb();
    await db.execAsync("DROP TABLE IF EXISTS stamps");
    await db.execAsync(
      "CREATE TABLE stamps (id INTEGER PRIMARY KEY AUTOINCREMENT, stamped_at TEXT)",
    );

    const saved = await saveStamp({ rallyId: 99 });
    expect(saved.rallyId).toBe(99);
    await expect(listStamps()).resolves.toEqual([saved]);
  });
});

describe("ST-003 stamp memo", () => {
  test("saved stamp has null memo", async () => {
    const saved = await saveStamp({ rallyId: 1 });
    expect(saved.memo).toBeNull();

    const [latest] = await listStamps();
    expect(latest).toEqual(saved);
  });

  test("updateStampMemo persists memo in list", async () => {
    const saved = await saveStamp({ rallyId: 1 });
    const updated = await updateStampMemo({ id: saved.id, memo: "Met them" });

    expect(updated).toEqual({
      ...saved,
      memo: "Met them",
    });

    const [latest] = await listStamps();
    expect(latest).toEqual(updated);
    expect(latest.rallyId).toBe(1);
    expect(latest.stampedAt).toBe("2026-09-19T12:34:00.000Z");
  });

  test("supports save, list, and update on legacy stamps table without memo column", async () => {
    const db = await getDb();
    await db.execAsync("DROP TABLE IF EXISTS stamps");
    await db.execAsync(
      "CREATE TABLE stamps (id INTEGER PRIMARY KEY AUTOINCREMENT, rally_id INTEGER NOT NULL, stamped_at TEXT NOT NULL)",
    );

    const saved = await saveStamp({ rallyId: 99 });
    expect(saved.memo).toBeNull();
    await expect(listStamps()).resolves.toEqual([saved]);

    const updated = await updateStampMemo({ id: saved.id, memo: "Kyoto" });
    expect(updated.memo).toBe("Kyoto");
    await expect(listStamps()).resolves.toEqual([updated]);
  });
});

describe("S-025 ST-002 past stamp", () => {
  const pastStampedAt = new Date(2026, 8, 17, 11, 40).toISOString();

  test("saves a stamp with the given past stampedAt", async () => {
    const saved = await saveStamp({ rallyId: 201, stampedAt: pastStampedAt });
    expect(saved).toMatchObject({ rallyId: 201, stampedAt: pastStampedAt });

    const stamps = await listStamps();
    expect(stamps).toContainEqual(saved);
  });

  test("rejects a past stamp on a local day the rally already has", async () => {
    await saveStamp({ rallyId: 202, stampedAt: pastStampedAt });

    await expect(
      saveStamp({
        rallyId: 202,
        stampedAt: new Date(2026, 8, 17, 21, 5).toISOString(),
      }),
    ).rejects.toThrow("already has a stamp");

    const stamps = await listStamps();
    expect(stamps.filter((stamp) => stamp.rallyId === 202)).toHaveLength(1);
  });

  test("allows a past stamp on the same day for another rally", async () => {
    await saveStamp({ rallyId: 203, stampedAt: pastStampedAt });

    await expect(
      saveStamp({ rallyId: 204, stampedAt: pastStampedAt }),
    ).resolves.toMatchObject({ rallyId: 204 });
  });

  test("keeps stamping now without the same-day check", async () => {
    await saveStamp({ rallyId: 205 });

    await expect(saveStamp({ rallyId: 205 })).resolves.toMatchObject({
      rallyId: 205,
    });
  });

  test("rejects a future stampedAt", async () => {
    await expect(
      saveStamp({ rallyId: 206, stampedAt: "2026-09-19T12:35:00.000Z" }),
    ).rejects.toThrow();
  });

  test("lists stamps newest stampedAt first", async () => {
    const now = await saveStamp({ rallyId: 207 });
    const past = await saveStamp({ rallyId: 207, stampedAt: pastStampedAt });

    const stamps = await listStamps();
    expect(stamps.filter((stamp) => stamp.rallyId === 207)).toEqual([
      now,
      past,
    ]);
  });
});

describe("S-006 ST-005 stamp update and delete", () => {
  const localAt = (day: number, hours: number) =>
    new Date(2026, 8, day, hours, 0).toISOString();

  test("updates stampedAt and memo and keeps id and rallyId", async () => {
    const saved = await saveStamp({ rallyId: 501 });

    const updated = await updateStamp({
      id: saved.id,
      stampedAt: localAt(10, 9),
      memo: "  Met them  ",
    });

    expect(updated).toEqual({
      id: saved.id,
      rallyId: 501,
      stampedAt: localAt(10, 9),
      memo: "Met them",
    });
    expect((await listStamps()).find((stamp) => stamp.id === saved.id)).toEqual(
      updated,
    );
  });

  test("clears the memo when the new memo is blank", async () => {
    const saved = await saveStamp({ rallyId: 502 });
    await updateStampMemo({ id: saved.id, memo: "Met them" });

    const updated = await updateStamp({
      id: saved.id,
      stampedAt: saved.stampedAt,
      memo: "   ",
    });

    expect(updated.memo).toBeNull();
  });

  test("allows changing the time within the stamp's own local day", async () => {
    const saved = await saveStamp({ rallyId: 503, stampedAt: localAt(10, 9) });

    await expect(
      updateStamp({ id: saved.id, stampedAt: localAt(10, 18), memo: "" }),
    ).resolves.toMatchObject({ stampedAt: localAt(10, 18) });
  });

  test("rejects moving onto a local day the rally already has", async () => {
    await saveStamp({ rallyId: 504, stampedAt: localAt(10, 9) });
    const other = await saveStamp({
      rallyId: 504,
      stampedAt: localAt(11, 9),
    });

    await expect(
      updateStamp({ id: other.id, stampedAt: localAt(10, 20), memo: "" }),
    ).rejects.toThrow("already has a stamp");
    expect(
      (await listStamps()).find((stamp) => stamp.id === other.id)?.stampedAt,
    ).toBe(localAt(11, 9));
  });

  test("allows moving onto a day only another rally has", async () => {
    await saveStamp({ rallyId: 505, stampedAt: localAt(10, 9) });
    const saved = await saveStamp({ rallyId: 506, stampedAt: localAt(11, 9) });

    await expect(
      updateStamp({ id: saved.id, stampedAt: localAt(10, 9), memo: "" }),
    ).resolves.toMatchObject({ stampedAt: localAt(10, 9) });
  });

  test("rejects a future stampedAt", async () => {
    const saved = await saveStamp({ rallyId: 507, stampedAt: localAt(10, 9) });

    await expect(
      updateStamp({
        id: saved.id,
        stampedAt: "2026-09-19T12:35:00.000Z",
        memo: "",
      }),
    ).rejects.toThrow();
  });

  test("rejects an unknown stamp id", async () => {
    await expect(
      updateStamp({ id: 999999, stampedAt: localAt(10, 9), memo: "" }),
    ).rejects.toThrow("Stamp not found");
  });

  test("deleteStamp removes only that stamp", async () => {
    const kept = await saveStamp({ rallyId: 508, stampedAt: localAt(10, 9) });
    const removed = await saveStamp({ rallyId: 508 });

    await deleteStamp(removed.id);

    const stamps = (await listStamps()).filter(
      (stamp) => stamp.rallyId === 508,
    );
    expect(stamps).toEqual([kept]);
  });
});
