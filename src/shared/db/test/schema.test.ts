import { type SQLiteDatabase } from "expo-sqlite";

import { tableColumnNames } from "../table-columns";

import { loadFreshDb } from "./load-fresh-db";

const userVersion = async (db: SQLiteDatabase) => {
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  return row?.user_version;
};

describe("RT-002 ST-001 schema version", () => {
  test("sets up a new database and marks it as version 1", async () => {
    const { getDb, schema } = loadFreshDb();

    await schema.withAppDb();

    const db = await getDb();
    await expect(userVersion(db)).resolves.toBe(1);
    const tables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('rallies', 'stamps', 'stamp_photos') ORDER BY name",
    );
    expect(tables.map(({ name }) => name)).toEqual([
      "rallies",
      "stamp_photos",
      "stamps",
    ]);
  });

  test("moves a database without a version to version 1", async () => {
    const { getDb, schema } = loadFreshDb();
    const db = await getDb();
    await db.execAsync(`
      CREATE TABLE rallies (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, type TEXT NOT NULL);
      INSERT INTO rallies (name, type) VALUES ('Walk', 'action');
    `);

    await schema.withAppDb();

    await expect(userVersion(db)).resolves.toBe(1);
    await expect(tableColumnNames(db, "rallies")).resolves.toEqual([
      "id",
      "name",
      "emoji",
      "is_favorite",
      "is_archived",
    ]);
  });

  test("does not set up a database that is already version 1 again", async () => {
    const { getDb, schema } = loadFreshDb();
    const db = await getDb();
    // An old stamps table would be dropped by the version 0 setup.
    await db.execAsync(`
      CREATE TABLE stamps (id INTEGER PRIMARY KEY AUTOINCREMENT, stamped_at TEXT NOT NULL);
      INSERT INTO stamps (stamped_at) VALUES ('2026-09-01T00:00:00.000Z');
      PRAGMA user_version = 1;
    `);

    await schema.withAppDb();

    const stamps = await db.getAllAsync("SELECT * FROM stamps");
    expect(stamps).toHaveLength(1);
    await expect(tableColumnNames(db, "rallies")).resolves.toEqual([]);
  });

  test("keeps version 0 and every change undone when the setup fails, and retries", async () => {
    const { getDb, schema } = loadFreshDb();
    const db = await getDb();
    // SQLite cannot drop an indexed column, so dropping `type` fails after
    // the other rallies columns were added.
    await db.execAsync(`
      CREATE TABLE rallies (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, type TEXT NOT NULL);
      CREATE INDEX rallies_type ON rallies (type);
    `);

    await expect(schema.withAppDb()).rejects.toThrow();

    await expect(userVersion(db)).resolves.toBe(0);
    await expect(tableColumnNames(db, "rallies")).resolves.toEqual([
      "id",
      "name",
      "type",
    ]);

    await db.execAsync("DROP INDEX rallies_type");
    await schema.withAppDb();

    await expect(userVersion(db)).resolves.toBe(1);
  });
});
