import type * as FileSystemModule from "expo-file-system";

import type * as RalliesDbModule from "@/features/rallies/db/rallies-db";
import type * as StampsDbModule from "@/features/rallies/db/stamps-db";

import { backupSchema, type Backup } from "../../schemas/backup";
import type * as BackupDbModule from "../backup-db";

jest.useFakeTimers();

beforeEach(() => {
  jest.setSystemTime(new Date("2026-10-25T06:00:00.000Z"));
});

type FreshDb = {
  fileSystem: typeof FileSystemModule;
  backupDb: typeof BackupDbModule;
  ralliesDb: typeof RalliesDbModule;
  stampsDb: typeof StampsDbModule;
};

// A new in-memory database and file store for each test, like a cold app
// start.
function loadFreshDb(): FreshDb {
  let modules: FreshDb | undefined;
  jest.isolateModules(() => {
    modules = {
      fileSystem: require("expo-file-system") as typeof FileSystemModule,
      backupDb: require("../backup-db") as typeof BackupDbModule,
      ralliesDb:
        require("@/features/rallies/db/rallies-db") as typeof RalliesDbModule,
      stampsDb:
        require("@/features/rallies/db/stamps-db") as typeof StampsDbModule,
    };
  });
  if (!modules) throw new Error("db modules did not load");
  return modules;
}

describe("S-041 T-001 ST-003 read every rally and stamp", () => {
  test("returns an empty file for an empty database", async () => {
    const { backupDb } = loadFreshDb();

    expect(await backupDb.readBackup()).toEqual({
      app: "stamp-log",
      version: 1,
      exportedAt: "2026-10-25T06:00:00.000Z",
      rallies: [],
      stamps: [],
    });
  });

  test("includes every saved rally and stamp, archived ones too", async () => {
    const { backupDb, ralliesDb, stampsDb } = loadFreshDb();
    await ralliesDb.saveRally({ name: "Kyoto trip", emoji: "⛩️" });
    await ralliesDb.saveRally({ name: "Weekend runs", emoji: "🏃" });
    const [runs, kyoto] = await ralliesDb.listRallies();
    await ralliesDb.setRallyFavorite({ id: kyoto.id, isFavorite: true });
    await ralliesDb.setRallyArchived({ id: runs.id, isArchived: true });
    const kyotoStamp = await stampsDb.saveStamp({
      rallyId: kyoto.id,
      stampedAt: "2026-10-20T03:00:00.000Z",
    });
    await stampsDb.updateStampMemo({
      id: kyotoStamp.id,
      memo: "Fushimi Inari",
    });
    const runsStamp = await stampsDb.saveStamp({ rallyId: runs.id });

    const backup = await backupDb.readBackup();

    expect(backupSchema.parse(backup)).toEqual(backup);
    expect(backup.rallies).toEqual(
      expect.arrayContaining([
        {
          id: kyoto.id,
          name: "Kyoto trip",
          emoji: "⛩️",
          isFavorite: true,
          isArchived: false,
        },
        {
          id: runs.id,
          name: "Weekend runs",
          emoji: "🏃",
          isFavorite: false,
          isArchived: true,
        },
      ]),
    );
    expect(backup.rallies).toHaveLength(2);
    expect(backup.stamps).toEqual(
      expect.arrayContaining([
        {
          id: kyotoStamp.id,
          rallyId: kyoto.id,
          stampedAt: "2026-10-20T03:00:00.000Z",
          memo: "Fushimi Inari",
        },
        {
          id: runsStamp.id,
          rallyId: runs.id,
          stampedAt: "2026-10-25T06:00:00.000Z",
          memo: null,
        },
      ]),
    );
    expect(backup.stamps).toHaveLength(2);
  });

  test("keeps a stamp with photos but leaves the photos out", async () => {
    const { fileSystem, backupDb, ralliesDb, stampsDb } = loadFreshDb();
    const picked = new fileSystem.File(fileSystem.Paths.cache, "picked.jpg");
    picked.write("jpeg");
    await ralliesDb.saveRally({ name: "Kyoto trip" });
    const [kyoto] = await ralliesDb.listRallies();
    const stamp = await stampsDb.saveStamp({ rallyId: kyoto.id });
    await stampsDb.updateStampMemo({
      id: stamp.id,
      memo: "",
      photoUris: [picked.uri],
    });

    const { stamps } = await backupDb.readBackup();

    expect(stamps).toEqual([
      {
        id: stamp.id,
        rallyId: kyoto.id,
        stampedAt: "2026-10-25T06:00:00.000Z",
        memo: null,
      },
    ]);
  });
});

const fileBackup: Backup = {
  app: "stamp-log",
  version: 1,
  exportedAt: "2026-10-24T06:00:00.000Z",
  rallies: [
    {
      id: 12,
      name: "Edinburgh",
      emoji: "☕️",
      isFavorite: true,
      isArchived: false,
    },
    {
      id: 18,
      name: "Drinks",
      emoji: "🍻",
      isFavorite: false,
      isArchived: true,
    },
  ],
  stamps: [
    {
      id: 68,
      rallyId: 12,
      stampedAt: "2026-10-25T03:29:06.662Z",
      memo: "12:15",
    },
    { id: 72, rallyId: 18, stampedAt: "2026-10-24T11:00:00.000Z", memo: null },
  ],
};

describe("S-041 T-002 ST-001 replace every rally and stamp", () => {
  test("reads back the same rallies and stamps after replacing", async () => {
    const { backupDb, ralliesDb, stampsDb } = loadFreshDb();
    await ralliesDb.saveRally({ name: "Old rally" });
    const [old] = await ralliesDb.listRallies();
    await stampsDb.saveStamp({ rallyId: old.id });

    await backupDb.replaceWithBackup(fileBackup);

    const backup = await backupDb.readBackup();
    expect(backup.rallies).toEqual(expect.arrayContaining(fileBackup.rallies));
    expect(backup.rallies).toHaveLength(2);
    expect(backup.stamps).toEqual(expect.arrayContaining(fileBackup.stamps));
    expect(backup.stamps).toHaveLength(2);
  });

  test("keeps the data as it was when replacing fails midway", async () => {
    const { backupDb, ralliesDb, stampsDb } = loadFreshDb();
    await ralliesDb.saveRally({ name: "Old rally" });
    const [old] = await ralliesDb.listRallies();
    await stampsDb.saveStamp({ rallyId: old.id });
    const before = await backupDb.readBackup();
    const [stamp] = fileBackup.stamps;

    await expect(
      backupDb.replaceWithBackup({
        ...fileBackup,
        // The same id twice cannot both be inserted.
        stamps: [stamp, { ...stamp, rallyId: 18 }],
      }),
    ).rejects.toThrow();

    expect(await backupDb.readBackup()).toEqual(before);
  });

  test("removes this device's photo rows and files", async () => {
    const { fileSystem, backupDb, ralliesDb, stampsDb } = loadFreshDb();
    const picked = new fileSystem.File(fileSystem.Paths.cache, "picked.jpg");
    picked.write("jpeg");
    await ralliesDb.saveRally({ name: "Old rally" });
    const [old] = await ralliesDb.listRallies();
    const stamp = await stampsDb.saveStamp({ rallyId: old.id });
    await stampsDb.updateStampMemo({
      id: stamp.id,
      memo: "",
      photoUris: [picked.uri],
    });
    const photosDirectory = new fileSystem.Directory(
      fileSystem.Paths.document,
      "stamp-photos",
    );
    expect(photosDirectory.list()).toHaveLength(1);

    await backupDb.replaceWithBackup({
      ...fileBackup,
      stamps: [{ ...fileBackup.stamps[0], id: stamp.id }],
    });

    const stamps = await stampsDb.listStamps();
    expect(stamps).toEqual([
      expect.objectContaining({ id: stamp.id, photos: [] }),
    ]);
    expect(photosDirectory.list()).toHaveLength(0);
  });
});
