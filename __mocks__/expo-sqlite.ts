// Jest replaces `expo-sqlite` (native) with an in-memory SQLite via node:sqlite.
// Only the API surface used by the app is implemented.
import { DatabaseSync, type SQLInputValue } from "node:sqlite";

export async function openDatabaseAsync(_databaseName: string) {
  const db = new DatabaseSync(":memory:");

  const database = {
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

  return {
    ...database,
    // The native API runs the task on its own connection; the in-memory
    // database has one, so the task gets the same queries.
    withExclusiveTransactionAsync: async (
      task: (txn: typeof database) => Promise<void>,
    ) => {
      db.exec("BEGIN");
      try {
        await task(database);
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
  };
}
