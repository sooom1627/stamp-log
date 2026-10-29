import { type SQLiteDatabase } from "expo-sqlite";

import { getDb } from "@/shared/db/get-db";

import { defaultRallyEmoji } from "../schemas/rallies";

import { tableColumnNames } from "./table-columns";

// Adds a column to a table that existed before the column did. A table that
// was just created already has it.
async function addColumnIfMissing(
  db: SQLiteDatabase,
  table: string,
  columns: string[],
  column: string,
  definition: string,
) {
  if (columns.length > 0 && !columns.includes(column)) {
    await db.execAsync(
      `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
    );
  }
}

async function ensureRallies(db: SQLiteDatabase) {
  const columns = await tableColumnNames(db, "rallies");
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS rallies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0
    );
  `);

  await addColumnIfMissing(db, "rallies", columns, "emoji", "TEXT");
  await addColumnIfMissing(
    db,
    "rallies",
    columns,
    "is_favorite",
    "INTEGER NOT NULL DEFAULT 0",
  );
  await addColumnIfMissing(
    db,
    "rallies",
    columns,
    "is_archived",
    "INTEGER NOT NULL DEFAULT 0",
  );

  await db.runAsync(
    "UPDATE rallies SET emoji = ? WHERE emoji IS NULL OR TRIM(emoji) = ''",
    defaultRallyEmoji,
  );

  // Rallies no longer have a type (S-040); its NOT NULL column would block inserts.
  if (columns.includes("type")) {
    await db.execAsync("ALTER TABLE rallies DROP COLUMN type");
  }
}

async function ensureStamps(db: SQLiteDatabase) {
  let columns = await tableColumnNames(db, "stamps");
  if (columns.length > 0 && !columns.includes("rally_id")) {
    await db.execAsync("DROP TABLE stamps");
    columns = [];
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS stamps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rally_id INTEGER NOT NULL,
      stamped_at TEXT NOT NULL,
      memo TEXT
    );
  `);

  await addColumnIfMissing(db, "stamps", columns, "memo", "TEXT");
}

// Photos are kept apart from stamps (S-035); the stamps table is unchanged.
async function ensureStampPhotos(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS stamp_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stamp_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      position INTEGER NOT NULL
    );
  `);
}

// Brings a database to the current tables. `PRAGMA user_version` records
// how far it got, so each step runs once per device. To change a table, add
// the next `if (version < N)` step at the end; never edit a step that shipped.
async function migrate(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const version = row?.user_version ?? 0;

  // Version 0 is every database made before versions: new, or any older
  // shape. The column checks bring each of them to version 1.
  if (version < 1) {
    // One transaction: a failed step leaves the tables and the version as
    // they were.
    await db.withExclusiveTransactionAsync(async (txn) => {
      await ensureRallies(txn);
      await ensureStamps(txn);
      await ensureStampPhotos(txn);
      await txn.execAsync("PRAGMA user_version = 1");
    });
  }
}

let appDbReady: Promise<SQLiteDatabase> | undefined;

// Sets up every table once per app start, in one place, so no query can reach
// a table that is not ready. A failed setup is retried on the next call.
export function withAppDb() {
  appDbReady ??= getDb()
    .then(async (db) => {
      await migrate(db);
      return db;
    })
    .catch((error: unknown) => {
      appDbReady = undefined;
      throw error;
    });
  return appDbReady;
}
