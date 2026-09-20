import { getDb } from "@/shared/db/get-db";

import { listStamps, saveStamp, updateStampMemo } from "../stamps-db";

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
