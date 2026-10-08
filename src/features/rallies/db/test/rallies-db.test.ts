import { deleteRally, listRallies, saveRally } from "../rallies-db";
import { listStamps, saveStamp } from "../stamps-db";

import { loadFreshDb } from "./load-fresh-db";

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
    const { getDb, ralliesDb } = loadFreshDb();
    const db = await getDb();
    await db.execAsync(`
      CREATE TABLE rallies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL
      );
      INSERT INTO rallies (name, type) VALUES ('Walk', 'action');
      INSERT INTO rallies (name, type) VALUES ('Cafe', 'place');
      INSERT INTO rallies (name, type) VALUES ('Friends', 'person');
    `);

    await expect(ralliesDb.listRallies()).resolves.toEqual([
      { id: 3, name: "Friends", type: "person", emoji: "😀" },
      { id: 2, name: "Cafe", type: "place", emoji: "🏠" },
      { id: 1, name: "Walk", type: "action", emoji: "👏" },
    ]);
  });
});

describe("deleteRally", () => {
  test("deletes a rally before any stamp table exists", async () => {
    const { ralliesDb } = loadFreshDb();
    await ralliesDb.saveRally({ name: "Walk", type: "action" });
    const [rally] = await ralliesDb.listRallies();

    await ralliesDb.deleteRally(rally.id);

    await expect(ralliesDb.listRallies()).resolves.toEqual([]);
  });

  test("deletes rally stamps but keeps stamps from other rallies", async () => {
    await saveStamp({ rallyId: 1 });
    await saveStamp({ rallyId: 2 });

    await deleteRally(1);

    const remaining = await listStamps();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].rallyId).toBe(2);
  });
});

describe("S-013 T-001 ST-002 updateRally", () => {
  test("updates name, type and emoji of the rally and keeps others and its stamps", async () => {
    const { ralliesDb, stampsDb } = loadFreshDb();
    await ralliesDb.saveRally({ name: "Walk", type: "action", emoji: "🚶" });
    await ralliesDb.saveRally({ name: "Cafe", type: "place", emoji: "☕" });
    const [cafe, walk] = await ralliesDb.listRallies();
    await stampsDb.saveStamp({ rallyId: walk.id });
    const stampsBefore = await stampsDb.listStamps();

    await ralliesDb.updateRally({
      id: walk.id,
      name: "  Long walk ",
      type: "person",
      emoji: "🥾",
    });

    await expect(ralliesDb.listRallies()).resolves.toEqual([
      cafe,
      { id: walk.id, name: "Long walk", type: "person", emoji: "🥾" },
    ]);
    await expect(stampsDb.listStamps()).resolves.toEqual(stampsBefore);
  });

  test("rejects invalid input without changing the rally", async () => {
    const { ralliesDb } = loadFreshDb();
    await ralliesDb.saveRally({ name: "Walk", type: "action", emoji: "🚶" });
    const [walk] = await ralliesDb.listRallies();

    await expect(
      ralliesDb.updateRally({ ...walk, name: "   " }),
    ).rejects.toThrow();

    await expect(ralliesDb.listRallies()).resolves.toEqual([walk]);
  });
});
