import { type SQLiteDatabase } from "expo-sqlite";

import { deleteRally, listRallies, saveRally } from "../rallies-db";
import { listStamps, saveStamp } from "../stamps-db";

import { loadFreshDb } from "./load-fresh-db";

describe("S-023 T-001 ST-002 rally emoji", () => {
  test("saves chosen emoji and returns it from list", async () => {
    await saveRally({ name: "Kyoto trip", emoji: "⛩️" });

    await expect(listRallies()).resolves.toEqual([
      expect.objectContaining({ name: "Kyoto trip", emoji: "⛩️" }),
    ]);
  });

  test("uses the default emoji when emoji is omitted", async () => {
    await saveRally({ name: "People met" });

    const [latest] = await listRallies();
    expect(latest).toEqual(
      expect.objectContaining({ name: "People met", emoji: "✨" }),
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
      {
        id: 3,
        name: "Friends",
        emoji: "✨",
        isFavorite: false,
        isArchived: false,
      },
      {
        id: 2,
        name: "Cafe",
        emoji: "✨",
        isFavorite: false,
        isArchived: false,
      },
      {
        id: 1,
        name: "Walk",
        emoji: "✨",
        isFavorite: false,
        isArchived: false,
      },
    ]);
  });
});

describe("deleteRally", () => {
  test("deletes a rally before any stamp table exists", async () => {
    const { ralliesDb } = loadFreshDb();
    await ralliesDb.saveRally({ name: "Walk" });
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

describe("S-017 T-001 ST-002 deleteRally in one transaction", () => {
  test("keeps the rally's stamps when deleting the rally fails", async () => {
    const { getDb, ralliesDb, stampsDb } = loadFreshDb();
    await ralliesDb.saveRally({ name: "Walk" });
    const [rally] = await ralliesDb.listRallies();
    await stampsDb.saveStamp({ rallyId: rally.id });
    const db = await getDb();
    await db.execAsync(`
      CREATE TRIGGER fail_rally_delete BEFORE DELETE ON rallies
      BEGIN SELECT RAISE(ABORT, 'delete failed'); END;
    `);

    await expect(ralliesDb.deleteRally(rally.id)).rejects.toThrow(
      "delete failed",
    );

    await expect(ralliesDb.listRallies()).resolves.toHaveLength(1);
    await expect(stampsDb.listStamps()).resolves.toHaveLength(1);
  });
});

describe("S-013 T-001 ST-002 updateRally", () => {
  test("updates name and emoji of the rally and keeps others and its stamps", async () => {
    const { ralliesDb, stampsDb } = loadFreshDb();
    await ralliesDb.saveRally({ name: "Walk", emoji: "🚶" });
    await ralliesDb.saveRally({ name: "Cafe", emoji: "☕" });
    const [cafe, walk] = await ralliesDb.listRallies();
    await stampsDb.saveStamp({ rallyId: walk.id });
    const stampsBefore = await stampsDb.listStamps();

    await ralliesDb.updateRally({
      id: walk.id,
      name: "  Long walk ",
      emoji: "🥾",
    });

    await expect(ralliesDb.listRallies()).resolves.toEqual([
      cafe,
      {
        id: walk.id,
        name: "Long walk",
        emoji: "🥾",
        isFavorite: false,
        isArchived: false,
      },
    ]);
    await expect(stampsDb.listStamps()).resolves.toEqual(stampsBefore);
  });

  test("rejects invalid input without changing the rally", async () => {
    const { ralliesDb } = loadFreshDb();
    await ralliesDb.saveRally({ name: "Walk", emoji: "🚶" });
    const [walk] = await ralliesDb.listRallies();

    await expect(
      ralliesDb.updateRally({ ...walk, name: "   " }),
    ).rejects.toThrow();

    await expect(ralliesDb.listRallies()).resolves.toEqual([walk]);
  });
});

describe("S-040 T-001 ST-003 rallies without type", () => {
  async function ralliesColumns(getDb: () => Promise<SQLiteDatabase>) {
    const db = await getDb();
    const rows = await db.getAllAsync<{ name: string }>(
      "PRAGMA table_info(rallies)",
    );
    return rows.map((row) => row.name);
  }

  test("creates the rallies table without a type column", async () => {
    const { getDb, ralliesDb } = loadFreshDb();

    await ralliesDb.saveRally({ name: "Walk" });

    await expect(ralliesColumns(getDb)).resolves.toEqual([
      "id",
      "name",
      "emoji",
      "is_favorite",
    ]);
    await expect(ralliesDb.listRallies()).resolves.toEqual([
      {
        id: 1,
        name: "Walk",
        emoji: "✨",
        isFavorite: false,
        isArchived: false,
      },
    ]);
  });

  test("drops the type column of an existing table and keeps rallies and stamps", async () => {
    const { getDb, ralliesDb, stampsDb } = loadFreshDb();
    const db = await getDb();
    await db.execAsync(`
      CREATE TABLE rallies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        emoji TEXT NOT NULL
      );
      INSERT INTO rallies (name, type, emoji) VALUES ('Walk', 'action', '🚶');
      INSERT INTO rallies (name, type, emoji) VALUES ('Cafe', 'place', '☕');
    `);
    await stampsDb.saveStamp({ rallyId: 1 });

    await expect(ralliesDb.listRallies()).resolves.toEqual([
      {
        id: 2,
        name: "Cafe",
        emoji: "☕",
        isFavorite: false,
        isArchived: false,
      },
      {
        id: 1,
        name: "Walk",
        emoji: "🚶",
        isFavorite: false,
        isArchived: false,
      },
    ]);
    await expect(ralliesColumns(getDb)).resolves.toEqual([
      "id",
      "name",
      "emoji",
      "is_favorite",
    ]);
    await expect(stampsDb.listStamps()).resolves.toEqual([
      expect.objectContaining({ rallyId: 1 }),
    ]);

    await ralliesDb.saveRally({ name: "Friends" });
    await expect(ralliesDb.listRallies()).resolves.toHaveLength(3);
  });
});

describe("S-032 T-001 ST-003 favorite rallies", () => {
  test("saves a new rally as not a favorite", async () => {
    const { ralliesDb } = loadFreshDb();

    await ralliesDb.saveRally({ name: "Walk", emoji: "🚶" });

    await expect(ralliesDb.listRallies()).resolves.toEqual([
      {
        id: 1,
        name: "Walk",
        emoji: "🚶",
        isFavorite: false,
        isArchived: false,
      },
    ]);
  });

  test("sets and clears the favorite of one rally", async () => {
    const { ralliesDb } = loadFreshDb();
    await ralliesDb.saveRally({ name: "Walk", emoji: "🚶" });
    await ralliesDb.saveRally({ name: "Cafe", emoji: "☕" });

    await ralliesDb.setRallyFavorite({ id: 1, isFavorite: true });

    await expect(ralliesDb.listRallies()).resolves.toEqual([
      {
        id: 2,
        name: "Cafe",
        emoji: "☕",
        isFavorite: false,
        isArchived: false,
      },
      { id: 1, name: "Walk", emoji: "🚶", isFavorite: true, isArchived: false },
    ]);

    await ralliesDb.setRallyFavorite({ id: 1, isFavorite: false });

    await expect(ralliesDb.listRallies()).resolves.toEqual([
      {
        id: 2,
        name: "Cafe",
        emoji: "☕",
        isFavorite: false,
        isArchived: false,
      },
      {
        id: 1,
        name: "Walk",
        emoji: "🚶",
        isFavorite: false,
        isArchived: false,
      },
    ]);
  });

  test("keeps the favorite when the rally is edited", async () => {
    const { ralliesDb } = loadFreshDb();
    await ralliesDb.saveRally({ name: "Walk", emoji: "🚶" });
    await ralliesDb.setRallyFavorite({ id: 1, isFavorite: true });

    await ralliesDb.updateRally({ id: 1, name: "Long walk", emoji: "🥾" });

    await expect(ralliesDb.listRallies()).resolves.toEqual([
      {
        id: 1,
        name: "Long walk",
        emoji: "🥾",
        isFavorite: true,
        isArchived: false,
      },
    ]);
  });

  test("adds the favorite column to an older table and reads its rallies as not favorites", async () => {
    const { getDb, ralliesDb } = loadFreshDb();
    const db = await getDb();
    await db.execAsync(`
      CREATE TABLE rallies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        emoji TEXT NOT NULL
      );
      INSERT INTO rallies (name, emoji) VALUES ('Walk', '🚶');
    `);

    await expect(ralliesDb.listRallies()).resolves.toEqual([
      {
        id: 1,
        name: "Walk",
        emoji: "🚶",
        isFavorite: false,
        isArchived: false,
      },
    ]);
    const columns = await db.getAllAsync<{ name: string }>(
      "PRAGMA table_info(rallies)",
    );
    expect(columns.map((column) => column.name)).toContain("is_favorite");

    await ralliesDb.setRallyFavorite({ id: 1, isFavorite: true });
    await expect(ralliesDb.listRallies()).resolves.toEqual([
      { id: 1, name: "Walk", emoji: "🚶", isFavorite: true, isArchived: false },
    ]);
  });
});
