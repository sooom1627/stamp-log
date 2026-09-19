import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

let dbPromise: Promise<SQLiteDatabase> | undefined;

export async function getDb(): Promise<SQLiteDatabase> {
  return (dbPromise ??= openDatabaseAsync("stamp-log.db"));
}
