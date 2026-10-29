import { backupSchema } from "../backup";

const validBackup = {
  app: "stamp-log",
  version: 1,
  exportedAt: "2026-10-25T06:00:00.000Z",
  rallies: [
    {
      id: 1,
      name: "Kyoto trip",
      emoji: "⛩️",
      isFavorite: true,
      isArchived: false,
    },
    {
      id: 2,
      name: "Weekend runs",
      emoji: "🏃",
      isFavorite: false,
      isArchived: true,
    },
  ],
  stamps: [
    {
      id: 10,
      rallyId: 1,
      stampedAt: "2026-10-20T03:00:00.000Z",
      memo: "Fushimi Inari",
    },
    { id: 11, rallyId: 2, stampedAt: "2026-10-21T22:00:00.000Z", memo: null },
  ],
};

describe("S-041 T-001 ST-002 backup file", () => {
  test("accepts a file exported by this app", () => {
    expect(backupSchema.parse(validBackup)).toEqual(validBackup);
  });

  test("accepts a file with no rallies and no stamps", () => {
    expect(
      backupSchema.safeParse({ ...validBackup, rallies: [], stamps: [] })
        .success,
    ).toBe(true);
  });

  test("rejects a file from another app", () => {
    expect(
      backupSchema.safeParse({ ...validBackup, app: "other-app" }).success,
    ).toBe(false);
  });

  test("rejects a version it cannot read", () => {
    expect(backupSchema.safeParse({ ...validBackup, version: 2 }).success).toBe(
      false,
    );
  });

  test.each(["app", "version", "exportedAt", "rallies", "stamps"])(
    "rejects a file without %s",
    (key) => {
      const backup: Record<string, unknown> = { ...validBackup };
      delete backup[key];
      expect(backupSchema.safeParse(backup).success).toBe(false);
    },
  );

  test("rejects a stamp without its stamped time", () => {
    const [stamp] = validBackup.stamps;
    expect(
      backupSchema.safeParse({
        ...validBackup,
        stamps: [{ id: stamp.id, rallyId: stamp.rallyId, memo: null }],
      }).success,
    ).toBe(false);
  });

  test("rejects a stamp that points to a rally not in the file", () => {
    expect(
      backupSchema.safeParse({
        ...validBackup,
        stamps: [{ ...validBackup.stamps[0], rallyId: 99 }],
      }).success,
    ).toBe(false);
  });

  test("leaves photos out of the stamps", () => {
    const backup = backupSchema.parse({
      ...validBackup,
      stamps: [{ ...validBackup.stamps[0], photos: [] }],
    });
    expect(backup.stamps[0]).not.toHaveProperty("photos");
  });
});
