import { getDb } from "@/shared/db/get-db";

import { deleteRally, listRallies, saveRally } from "../rallies-db";
import { listStamps, saveStamp } from "../stamps-db";

describe("S-023 T-001 ST-002 rally emoji", () => {
  test("saves chosen emoji and returns it from list", async () => {
    await saveRally({ name: "Kyoto trip", type: "place", emoji: "⛩️" });

    await expect(listRallies()).resolves.toEqual([
      expect.objectContaining({ name: "Kyoto trip", emoji: "⛩️" }),
    ]);
  });

  test("uses type default emoji when emoji is omitted", async () => {
    await saveRally({ name: "People met", type: "person" });

    const [latest] = await listRallies();
    expect(latest).toEqual(
      expect.objectContaining({ name: "People met", emoji: "😀" }),
    );
  });

  test("backfills legacy rallies table without emoji column", async () => {
    const db = await getDb();
    await db.execAsync("DROP TABLE IF EXISTS rallies");
    await db.execAsync(`
      CREATE TABLE rallies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL
      );
      INSERT INTO rallies (name, type) VALUES ('Walk', 'action');
    `);

    await expect(listRallies()).resolves.toEqual([
      { id: 1, name: "Walk", type: "action", emoji: "👏" },
    ]);
  });
});

describe("deleteRally", () => {
  test("deletes rally stamps but keeps stamps from other rallies", async () => {
    await saveStamp({ rallyId: 1 });
    await saveStamp({ rallyId: 2 });

    await deleteRally(1);

    const remaining = await listStamps();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].rallyId).toBe(2);
  });
});
