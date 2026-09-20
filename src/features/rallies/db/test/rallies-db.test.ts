import { getDb } from "@/shared/db/get-db";

import { deleteRally, listRallies, saveRally } from "../rallies-db";
import { listStamps, saveStamp } from "../stamps-db";

describe("S-023 T-001 ST-002 rallies の絵文字", () => {
  test("選んだ絵文字を保存して一覧から取得できる", async () => {
    await saveRally({ name: "京都旅行", type: "place", emoji: "⛩️" });

    await expect(listRallies()).resolves.toEqual([
      expect.objectContaining({ name: "京都旅行", emoji: "⛩️" }),
    ]);
  });

  test("絵文字を省略するとタイプの初期絵文字を保存する", async () => {
    await saveRally({ name: "会った人", type: "person" });

    const [latest] = await listRallies();
    expect(latest).toEqual(
      expect.objectContaining({ name: "会った人", emoji: "😀" }),
    );
  });

  test("emoji 列がない既存 rallies テーブルをタイプの初期値で補完する", async () => {
    const db = await getDb();
    await db.execAsync("DROP TABLE IF EXISTS rallies");
    await db.execAsync(`
      CREATE TABLE rallies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL
      );
      INSERT INTO rallies (name, type) VALUES ('散歩', 'action');
    `);

    await expect(listRallies()).resolves.toEqual([
      { id: 1, name: "散歩", type: "action", emoji: "👏" },
    ]);
  });
});

describe("deleteRally", () => {
  test("ラリーを削除するとそのスタンプも消え、他のラリーのスタンプは残る", async () => {
    await saveStamp({ rallyId: 1 });
    await saveStamp({ rallyId: 2 });

    await deleteRally(1);

    const remaining = await listStamps();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].rallyId).toBe(2);
  });
});
