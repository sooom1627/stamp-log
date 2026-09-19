import { getDb } from "@/shared/db/get-db";

import { listStamps, saveStamp } from "../stamps-db";

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
