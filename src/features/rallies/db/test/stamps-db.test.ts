import { getDb } from "@/shared/db/get-db";

import { listStamps, saveStamp, updateStampMemo } from "../stamps-db";

jest.useFakeTimers();

beforeEach(() => {
  jest.setSystemTime(new Date("2026-09-19T12:34:00.000Z"));
});

describe("ST-002 stamps の SQLite", () => {
  test("save した stamp が戻り値と list に rallyId と ISO stampedAt 付きで戻る", async () => {
    const saved = await saveStamp({ rallyId: 1 });
    expect(saved).toMatchObject({
      rallyId: 1,
      stampedAt: "2026-09-19T12:34:00.000Z",
    });
    expect(saved.id).toEqual(expect.any(Number));

    const [latest] = await listStamps();
    expect(latest).toEqual(saved);
  });

  test("2件 save すると新しい方が先", async () => {
    await saveStamp({ rallyId: 10 });
    await saveStamp({ rallyId: 11 });

    const [first, second] = await listStamps();
    expect(first.rallyId).toBe(11);
    expect(second.rallyId).toBe(10);
  });

  test("rallyId 列が無い旧 stamps テーブルでも save / list できる", async () => {
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

describe("ST-003 stamps の memo", () => {
  test("save した stamp の memo は null", async () => {
    const saved = await saveStamp({ rallyId: 1 });
    expect(saved.memo).toBeNull();

    const [latest] = await listStamps();
    expect(latest).toEqual(saved);
  });

  test("updateStampMemo すると list に memo が残る", async () => {
    const saved = await saveStamp({ rallyId: 1 });
    const updated = await updateStampMemo({ id: saved.id, memo: "会った" });

    expect(updated).toEqual({
      ...saved,
      memo: "会った",
    });

    const [latest] = await listStamps();
    expect(latest).toEqual(updated);
    expect(latest.rallyId).toBe(1);
    expect(latest.stampedAt).toBe("2026-09-19T12:34:00.000Z");
  });

  test("memo 列が無い旧 stamps テーブルでも save / list / update できる", async () => {
    const db = await getDb();
    await db.execAsync("DROP TABLE IF EXISTS stamps");
    await db.execAsync(
      "CREATE TABLE stamps (id INTEGER PRIMARY KEY AUTOINCREMENT, rally_id INTEGER NOT NULL, stamped_at TEXT NOT NULL)",
    );

    const saved = await saveStamp({ rallyId: 99 });
    expect(saved.memo).toBeNull();
    await expect(listStamps()).resolves.toEqual([saved]);

    const updated = await updateStampMemo({ id: saved.id, memo: "京都" });
    expect(updated.memo).toBe("京都");
    await expect(listStamps()).resolves.toEqual([updated]);
  });
});
