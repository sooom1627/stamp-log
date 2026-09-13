// Jest replaces `expo-sqlite` (native) with an in-memory SQLite via node:sqlite.
// Only the API surface used by the app is implemented.
import { DatabaseSync, type SQLInputValue } from "node:sqlite";

export async function openDatabaseAsync(_databaseName: string) {
  const db = new DatabaseSync(":memory:");

  return {
    execAsync: async (source: string) => {
      db.exec(source);
    },
    runAsync: async (source: string, ...params: SQLInputValue[]) => {
      const result = db.prepare(source).run(...params);
      return {
        lastInsertRowId: Number(result.lastInsertRowid),
        changes: Number(result.changes),
      };
    },
    getFirstAsync: async <T>(
      source: string,
      ...params: SQLInputValue[]
    ): Promise<T | null> => {
      const row = db.prepare(source).get(...params) as T | undefined;
      return row ?? null;
    },
    getAllAsync: async <T>(
      source: string,
      ...params: SQLInputValue[]
    ): Promise<T[]> => {
      return db.prepare(source).all(...params) as T[];
    },
    closeAsync: async () => {
      db.close();
    },
  };
}
