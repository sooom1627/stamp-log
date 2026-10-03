import { type SQLiteDatabase } from "expo-sqlite";

export async function tableColumnNames(
  db: SQLiteDatabase,
  table: "rallies" | "stamps",
) {
  const rows = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${table})`,
  );
  return rows.map((row) => row.name.toLowerCase());
}
