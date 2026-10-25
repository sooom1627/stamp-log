import { Directory, File, Paths } from "expo-file-system";

import { withAppDb } from "../schema";
import { stampPhotoThumbUri, stampPhotoUri } from "../stamp-photo-files";
import {
  deleteRallyStamps,
  deleteStamp,
  listStamps,
  saveStamp,
  updateStamp,
  updateStampMemo,
} from "../stamps-db";

import { loadFreshDb } from "./load-fresh-db";

jest.useFakeTimers();

beforeEach(() => {
  jest.setSystemTime(new Date("2026-09-19T12:34:00.000Z"));
});

let nextPickedId = 1;
// A photo picked from the library: it carries EXIF until re-encoded.
const pickPhoto = () => {
  const file = new File(Paths.cache, `picked-${nextPickedId++}.jpg`);
  file.write("jpeg with exif");
  return file.uri;
};
const savedPhotoFiles = () => {
  const directory = new Directory(Paths.document, "stamp-photos");
  return directory.exists ? directory.list() : [];
};
const savedThumbFiles = () => {
  const directory = new Directory(Paths.document, "stamp-photo-thumbs");
  return directory.exists ? directory.list() : [];
};

describe("ST-002 stamps SQLite", () => {
  test("returns saved stamp with rallyId and ISO stampedAt", async () => {
    const saved = await saveStamp({ rallyId: 1 });
    expect(saved).toMatchObject({
      rallyId: 1,
      stampedAt: "2026-09-19T12:34:00.000Z",
    });
    expect(saved.id).toEqual(expect.any(Number));

    const [latest] = await listStamps();
    expect(latest).toEqual(saved);
  });

  test("lists newest stamp first after two saves", async () => {
    await saveStamp({ rallyId: 10 });
    await saveStamp({ rallyId: 11 });

    const [first, second] = await listStamps();
    expect(first.rallyId).toBe(11);
    expect(second.rallyId).toBe(10);
  });

  test("supports save and list on legacy stamps table without rallyId column", async () => {
    const { getDb, stampsDb } = loadFreshDb();
    const db = await getDb();
    await db.execAsync(
      "CREATE TABLE stamps (id INTEGER PRIMARY KEY AUTOINCREMENT, stamped_at TEXT)",
    );

    const saved = await stampsDb.saveStamp({ rallyId: 99 });
    expect(saved.rallyId).toBe(99);
    await expect(stampsDb.listStamps()).resolves.toEqual([saved]);
  });
});

describe("ST-003 stamp memo", () => {
  test("saved stamp has null memo", async () => {
    const saved = await saveStamp({ rallyId: 1 });
    expect(saved.memo).toBeNull();

    const [latest] = await listStamps();
    expect(latest).toEqual(saved);
  });

  test("updateStampMemo persists memo in list", async () => {
    const saved = await saveStamp({ rallyId: 1 });
    const updated = await updateStampMemo({ id: saved.id, memo: "Met them" });

    expect(updated).toEqual({
      ...saved,
      memo: "Met them",
    });

    const [latest] = await listStamps();
    expect(latest).toEqual(updated);
    expect(latest.rallyId).toBe(1);
    expect(latest.stampedAt).toBe("2026-09-19T12:34:00.000Z");
  });

  test("updateStampMemo rejects an unknown stamp id", async () => {
    await expect(
      updateStampMemo({ id: 999999, memo: "Met them" }),
    ).rejects.toThrow("Stamp not found");
  });

  test("supports save, list, and update on legacy stamps table without memo column", async () => {
    const { getDb, stampsDb } = loadFreshDb();
    const db = await getDb();
    await db.execAsync(
      "CREATE TABLE stamps (id INTEGER PRIMARY KEY AUTOINCREMENT, rally_id INTEGER NOT NULL, stamped_at TEXT NOT NULL)",
    );

    const saved = await stampsDb.saveStamp({ rallyId: 99 });
    expect(saved.memo).toBeNull();
    await expect(stampsDb.listStamps()).resolves.toEqual([saved]);

    const updated = await stampsDb.updateStampMemo({
      id: saved.id,
      memo: "Kyoto",
    });
    expect(updated.memo).toBe("Kyoto");
    await expect(stampsDb.listStamps()).resolves.toEqual([updated]);
  });
});

describe("S-025 ST-002 past stamp", () => {
  const pastStampedAt = new Date(2026, 8, 17, 11, 40).toISOString();

  test("saves a stamp with the given past stampedAt", async () => {
    const saved = await saveStamp({ rallyId: 201, stampedAt: pastStampedAt });
    expect(saved).toMatchObject({ rallyId: 201, stampedAt: pastStampedAt });

    const stamps = await listStamps();
    expect(stamps).toContainEqual(saved);
  });

  test("rejects a past stamp on a local day the rally already has", async () => {
    await saveStamp({ rallyId: 202, stampedAt: pastStampedAt });

    await expect(
      saveStamp({
        rallyId: 202,
        stampedAt: new Date(2026, 8, 17, 21, 5).toISOString(),
      }),
    ).rejects.toThrow("already has a stamp");

    const stamps = await listStamps();
    expect(stamps.filter((stamp) => stamp.rallyId === 202)).toHaveLength(1);
  });

  test("allows a past stamp on the same day for another rally", async () => {
    await saveStamp({ rallyId: 203, stampedAt: pastStampedAt });

    await expect(
      saveStamp({ rallyId: 204, stampedAt: pastStampedAt }),
    ).resolves.toMatchObject({ rallyId: 204 });
  });

  test("keeps stamping now without the same-day check", async () => {
    await saveStamp({ rallyId: 205 });

    await expect(saveStamp({ rallyId: 205 })).resolves.toMatchObject({
      rallyId: 205,
    });
  });

  test("rejects a future stampedAt", async () => {
    await expect(
      saveStamp({ rallyId: 206, stampedAt: "2026-09-19T12:35:00.000Z" }),
    ).rejects.toThrow();
  });

  test("lists stamps newest stampedAt first", async () => {
    const now = await saveStamp({ rallyId: 207 });
    const past = await saveStamp({ rallyId: 207, stampedAt: pastStampedAt });

    const stamps = await listStamps();
    expect(stamps.filter((stamp) => stamp.rallyId === 207)).toEqual([
      now,
      past,
    ]);
  });
});

describe("S-006 ST-005 stamp update and delete", () => {
  const localAt = (day: number, hours: number) =>
    new Date(2026, 8, day, hours, 0).toISOString();

  test("updates stampedAt and memo and keeps id and rallyId", async () => {
    const saved = await saveStamp({ rallyId: 501 });

    const updated = await updateStamp({
      id: saved.id,
      stampedAt: localAt(10, 9),
      memo: "  Met them  ",
      keptPhotoIds: [],
      newPhotoUris: [],
    });

    expect(updated).toEqual({
      id: saved.id,
      rallyId: 501,
      stampedAt: localAt(10, 9),
      memo: "Met them",
      photos: [],
    });
    expect((await listStamps()).find((stamp) => stamp.id === saved.id)).toEqual(
      updated,
    );
  });

  test("clears the memo when the new memo is blank", async () => {
    const saved = await saveStamp({ rallyId: 502 });
    await updateStampMemo({ id: saved.id, memo: "Met them" });

    const updated = await updateStamp({
      id: saved.id,
      stampedAt: saved.stampedAt,
      memo: "   ",
      keptPhotoIds: [],
      newPhotoUris: [],
    });

    expect(updated.memo).toBeNull();
  });

  test("allows changing the time within the stamp's own local day", async () => {
    const saved = await saveStamp({ rallyId: 503, stampedAt: localAt(10, 9) });

    await expect(
      updateStamp({
        id: saved.id,
        stampedAt: localAt(10, 18),
        memo: "",
        keptPhotoIds: [],
        newPhotoUris: [],
      }),
    ).resolves.toMatchObject({ stampedAt: localAt(10, 18) });
  });

  test("rejects moving onto a local day the rally already has", async () => {
    await saveStamp({ rallyId: 504, stampedAt: localAt(10, 9) });
    const other = await saveStamp({
      rallyId: 504,
      stampedAt: localAt(11, 9),
    });

    await expect(
      updateStamp({
        id: other.id,
        stampedAt: localAt(10, 20),
        memo: "",
        keptPhotoIds: [],
        newPhotoUris: [],
      }),
    ).rejects.toThrow("already has a stamp");
    expect(
      (await listStamps()).find((stamp) => stamp.id === other.id)?.stampedAt,
    ).toBe(localAt(11, 9));
  });

  test("allows moving onto a day only another rally has", async () => {
    await saveStamp({ rallyId: 505, stampedAt: localAt(10, 9) });
    const saved = await saveStamp({ rallyId: 506, stampedAt: localAt(11, 9) });

    await expect(
      updateStamp({
        id: saved.id,
        stampedAt: localAt(10, 9),
        memo: "",
        keptPhotoIds: [],
        newPhotoUris: [],
      }),
    ).resolves.toMatchObject({ stampedAt: localAt(10, 9) });
  });

  test("rejects a future stampedAt", async () => {
    const saved = await saveStamp({ rallyId: 507, stampedAt: localAt(10, 9) });

    await expect(
      updateStamp({
        id: saved.id,
        stampedAt: "2026-09-19T12:35:00.000Z",
        memo: "",
        keptPhotoIds: [],
        newPhotoUris: [],
      }),
    ).rejects.toThrow();
  });

  test("rejects an unknown stamp id", async () => {
    await expect(
      updateStamp({
        id: 999999,
        stampedAt: localAt(10, 9),
        memo: "",
        keptPhotoIds: [],
        newPhotoUris: [],
      }),
    ).rejects.toThrow("Stamp not found");
  });

  test("deleteStamp removes only that stamp", async () => {
    const kept = await saveStamp({ rallyId: 508, stampedAt: localAt(10, 9) });
    const removed = await saveStamp({ rallyId: 508 });

    await deleteStamp(removed.id);

    const stamps = (await listStamps()).filter(
      (stamp) => stamp.rallyId === 508,
    );
    expect(stamps).toEqual([kept]);
  });
});

describe("RT-001 ST-002 one place sets up the tables", () => {
  test("sets up every table on a cold start", async () => {
    const { getDb, schema } = loadFreshDb();

    await schema.withAppDb();

    const db = await getDb();
    const tables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('rallies', 'stamps') ORDER BY name",
    );
    expect(tables.map(({ name }) => name)).toEqual(["rallies", "stamps"]);
  });

  test("deleteRallyStamps removes only that rally's stamps in the caller's transaction", async () => {
    const removed = await saveStamp({ rallyId: 601 });
    const kept = await saveStamp({ rallyId: 602 });
    const db = await withAppDb();

    await db.withExclusiveTransactionAsync(async (txn) => {
      await deleteRallyStamps(txn, removed.rallyId);
    });

    const stamps = await listStamps();
    expect(stamps.some((stamp) => stamp.rallyId === 601)).toBe(false);
    expect(stamps).toContainEqual(kept);
  });
});

describe("S-035 ST-003 stamp photos", () => {
  test("a new stamp has no photos", async () => {
    const saved = await saveStamp({ rallyId: 301 });
    expect(saved.photos).toEqual([]);
    const listed = (await listStamps()).find((stamp) => stamp.id === saved.id);
    expect(listed?.photos).toEqual([]);
  });

  test("saves photos only and keeps the memo as it was", async () => {
    const saved = await saveStamp({ rallyId: 302 });
    await updateStampMemo({ id: saved.id, memo: "Kyoto" });

    const updated = await updateStampMemo({
      id: saved.id,
      memo: "",
      photoUris: [pickPhoto(), pickPhoto()],
    });

    expect(updated.memo).toBe("Kyoto");
    expect(updated.photos.map((photo) => photo.position)).toEqual([0, 1]);
    expect((await listStamps()).find((stamp) => stamp.id === saved.id)).toEqual(
      updated,
    );
  });

  test("lists each stamp with only its own photos, in position order", async () => {
    const first = await saveStamp({ rallyId: 306 });
    const second = await saveStamp({ rallyId: 307 });
    await updateStampMemo({
      id: first.id,
      memo: "",
      photoUris: [pickPhoto(), pickPhoto()],
    });
    await updateStampMemo({
      id: second.id,
      memo: "",
      photoUris: [pickPhoto()],
    });
    await updateStampMemo({ id: first.id, memo: "", photoUris: [pickPhoto()] });

    const listed = await listStamps();
    const photosOf = (id: number) =>
      listed.find((stamp) => stamp.id === id)?.photos ?? [];

    expect(photosOf(first.id).map(({ stampId }) => stampId)).toEqual([
      first.id,
      first.id,
      first.id,
    ]);
    expect(photosOf(first.id).map(({ position }) => position)).toEqual([
      0, 1, 2,
    ]);
    expect(photosOf(second.id).map(({ stampId }) => stampId)).toEqual([
      second.id,
    ]);
  });

  test("saves a memo and photos together", async () => {
    const saved = await saveStamp({ rallyId: 303 });

    const updated = await updateStampMemo({
      id: saved.id,
      memo: "Met them",
      photoUris: [pickPhoto()],
    });

    expect(updated.memo).toBe("Met them");
    expect(updated.photos).toHaveLength(1);
  });

  test("stores a re-encoded copy, not the picked photo itself", async () => {
    const saved = await saveStamp({ rallyId: 304 });
    const pickedUri = pickPhoto();

    const {
      photos: [photo],
    } = await updateStampMemo({
      id: saved.id,
      memo: "",
      photoUris: [pickedUri],
    });

    const stored = new File(stampPhotoUri(photo.fileName));
    expect(stored.uri).not.toBe(pickedUri);
    expect(stored.textSync()).toBe(`re-encoded:${pickedUri}`);
    // The photo in the library is left as it was.
    expect(new File(pickedUri).textSync()).toBe("jpeg with exif");
  });

  test("rejects going over 4 photos and saves no file or row", async () => {
    const saved = await saveStamp({ rallyId: 305 });
    await updateStampMemo({
      id: saved.id,
      memo: "",
      photoUris: [pickPhoto(), pickPhoto(), pickPhoto()],
    });
    const filesBefore = savedPhotoFiles().length;

    await expect(
      updateStampMemo({
        id: saved.id,
        memo: "More",
        photoUris: [pickPhoto(), pickPhoto()],
      }),
    ).rejects.toThrow();

    const listed = (await listStamps()).find((stamp) => stamp.id === saved.id);
    expect(listed?.photos).toHaveLength(3);
    expect(listed?.memo).toBeNull();
    expect(savedPhotoFiles()).toHaveLength(filesBefore);
  });

  test("leaves no file behind when the db write fails", async () => {
    const saved = await saveStamp({ rallyId: 306 });
    const filesBefore = savedPhotoFiles().length;
    const db = await withAppDb();
    const runInTransaction = db.withExclusiveTransactionAsync;
    // The photo rows fail to insert inside the transaction.
    const spy = jest
      .spyOn(db, "withExclusiveTransactionAsync")
      .mockImplementation((task) =>
        runInTransaction((txn) =>
          task({
            ...txn,
            runAsync: (source: string, ...params: never[]) =>
              source.startsWith("INSERT INTO stamp_photos")
                ? Promise.reject(new Error("disk full"))
                : txn.runAsync(source, ...params),
          } as typeof txn),
        ),
      );

    try {
      await expect(
        updateStampMemo({
          id: saved.id,
          memo: "Kyoto",
          photoUris: [pickPhoto(), pickPhoto()],
        }),
      ).rejects.toThrow("disk full");
    } finally {
      spy.mockRestore();
    }

    const listed = (await listStamps()).find((stamp) => stamp.id === saved.id);
    expect(listed).toMatchObject({ memo: null, photos: [] });
    expect(savedPhotoFiles()).toHaveLength(filesBefore);
  });

  test("creates the photo table on an old db and reads old stamps with no photos", async () => {
    const { getDb, stampsDb } = loadFreshDb();
    const db = await getDb();
    await db.execAsync(
      "CREATE TABLE stamps (id INTEGER PRIMARY KEY AUTOINCREMENT, rally_id INTEGER NOT NULL, stamped_at TEXT NOT NULL, memo TEXT)",
    );
    await db.runAsync(
      "INSERT INTO stamps (rally_id, stamped_at) VALUES (?, ?)",
      7,
      "2026-09-01T00:00:00.000Z",
    );

    const [old] = await stampsDb.listStamps();
    expect(old.photos).toEqual([]);
    await expect(
      db.getAllAsync(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'stamp_photos'",
      ),
    ).resolves.toHaveLength(1);
  });
});

describe("S-035 T-002 ST-001 deleting a stamp removes its photos", () => {
  const savePhotoStamp = async (rallyId: number, count: number) => {
    const saved = await saveStamp({ rallyId });
    return updateStampMemo({
      id: saved.id,
      memo: "",
      photoUris: Array.from({ length: count }, pickPhoto),
    });
  };
  const photoFileExists = (fileName: string) =>
    new File(stampPhotoUri(fileName)).exists;
  const photoRowCount = async (stampId: number) => {
    const db = await withAppDb();
    const row = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) AS count FROM stamp_photos WHERE stamp_id = ?",
      stampId,
    );
    return row?.count;
  };

  test("removes the stamp's photo rows and files and keeps other stamps' photos", async () => {
    const removed = await savePhotoStamp(701, 2);
    const kept = await savePhotoStamp(701, 1);

    await deleteStamp(removed.id);

    expect(await photoRowCount(removed.id)).toBe(0);
    expect(
      removed.photos.map(({ fileName }) => photoFileExists(fileName)),
    ).toEqual([false, false]);
    const listed = (await listStamps()).find((stamp) => stamp.id === kept.id);
    expect(listed?.photos).toEqual(kept.photos);
    expect(photoFileExists(kept.photos[0].fileName)).toBe(true);
  });

  test("keeps the photo rows and files when the db delete fails", async () => {
    const stamp = await savePhotoStamp(702, 2);
    const db = await withAppDb();
    await db.execAsync(`
      CREATE TRIGGER fail_stamp_delete BEFORE DELETE ON stamps
      WHEN OLD.id = ${stamp.id}
      BEGIN SELECT RAISE(ABORT, 'delete failed'); END;
    `);

    try {
      await expect(deleteStamp(stamp.id)).rejects.toThrow("delete failed");
    } finally {
      await db.execAsync("DROP TRIGGER fail_stamp_delete");
    }

    const listed = (await listStamps()).find(({ id }) => id === stamp.id);
    expect(listed?.photos).toEqual(stamp.photos);
    expect(
      stamp.photos.every(({ fileName }) => photoFileExists(fileName)),
    ).toBe(true);
  });

  test("keeps the stamp deleted when a photo file cannot be removed", async () => {
    const stamp = await savePhotoStamp(703, 1);
    const spy = jest.spyOn(File.prototype, "delete").mockImplementation(() => {
      throw new Error("file busy");
    });

    try {
      await expect(deleteStamp(stamp.id)).resolves.toBeUndefined();
    } finally {
      spy.mockRestore();
    }

    expect((await listStamps()).some(({ id }) => id === stamp.id)).toBe(false);
    expect(await photoRowCount(stamp.id)).toBe(0);
  });

  test("deleteRallyStamps removes the rally's photo rows and returns their files", async () => {
    const removed = await savePhotoStamp(704, 2);
    const kept = await savePhotoStamp(705, 1);
    const db = await withAppDb();

    let fileNames: string[] = [];
    await db.withExclusiveTransactionAsync(async (txn) => {
      fileNames = await deleteRallyStamps(txn, removed.rallyId);
    });

    expect(await photoRowCount(removed.id)).toBe(0);
    expect(await photoRowCount(kept.id)).toBe(1);
    expect(fileNames).toEqual(removed.photos.map(({ fileName }) => fileName));
  });
});

describe("S-036 ST-003 replacing photos on update", () => {
  const savePhotoStamp = async (rallyId: number, count: number) => {
    const saved = await saveStamp({ rallyId, stampedAt: localDay(10) });
    return updateStampMemo({
      id: saved.id,
      memo: "",
      photoUris: Array.from({ length: count }, pickPhoto),
    });
  };
  const localDay = (day: number) => new Date(2026, 8, day, 9, 0).toISOString();
  const photoFileExists = (fileName: string) =>
    new File(stampPhotoUri(fileName)).exists;
  const findListed = async (id: number) =>
    (await listStamps()).find((stamp) => stamp.id === id);

  test("removes a dropped photo's row and file and keeps the rest", async () => {
    const stamp = await savePhotoStamp(901, 2);
    const [dropped, kept] = stamp.photos;

    const updated = await updateStamp({
      id: stamp.id,
      stampedAt: stamp.stampedAt,
      memo: "",
      keptPhotoIds: [kept.id],
      newPhotoUris: [],
    });

    expect(updated.photos.map(({ id }) => id)).toEqual([kept.id]);
    expect(photoFileExists(dropped.fileName)).toBe(false);
    expect(photoFileExists(kept.fileName)).toBe(true);
    expect(await findListed(stamp.id)).toEqual(updated);
  });

  test("adds new photos after the kept ones as re-encoded copies", async () => {
    const stamp = await savePhotoStamp(902, 1);
    const pickedUri = pickPhoto();

    const updated = await updateStamp({
      id: stamp.id,
      stampedAt: stamp.stampedAt,
      memo: "",
      keptPhotoIds: [stamp.photos[0].id],
      newPhotoUris: [pickedUri],
    });

    expect(updated.photos).toHaveLength(2);
    expect(updated.photos[0]).toEqual(stamp.photos[0]);
    expect(new File(stampPhotoUri(updated.photos[1].fileName)).textSync()).toBe(
      `re-encoded:${pickedUri}`,
    );
  });

  test("renumbers positions from 0", async () => {
    const stamp = await savePhotoStamp(903, 3);
    const [, second, third] = stamp.photos;

    const updated = await updateStamp({
      id: stamp.id,
      stampedAt: stamp.stampedAt,
      memo: "",
      keptPhotoIds: [second.id, third.id],
      newPhotoUris: [pickPhoto()],
    });

    expect(updated.photos.map(({ position }) => position)).toEqual([0, 1, 2]);
    expect(updated.photos.slice(0, 2).map(({ id }) => id)).toEqual([
      second.id,
      third.id,
    ]);
  });

  test("ignores kept ids of another stamp's photos", async () => {
    const other = await savePhotoStamp(904, 1);
    const stamp = await savePhotoStamp(905, 1);

    const updated = await updateStamp({
      id: stamp.id,
      stampedAt: stamp.stampedAt,
      memo: "",
      keptPhotoIds: [other.photos[0].id],
      newPhotoUris: [],
    });

    expect(updated.photos).toEqual([]);
    expect((await findListed(other.id))?.photos).toEqual(other.photos);
    expect(photoFileExists(other.photos[0].fileName)).toBe(true);
  });

  test("rejects going over 4 photos and changes nothing", async () => {
    const stamp = await savePhotoStamp(906, 3);
    const filesBefore = savedPhotoFiles().length;

    await expect(
      updateStamp({
        id: stamp.id,
        stampedAt: stamp.stampedAt,
        memo: "Changed",
        keptPhotoIds: stamp.photos.map(({ id }) => id),
        newPhotoUris: [pickPhoto(), pickPhoto()],
      }),
    ).rejects.toThrow();

    expect(await findListed(stamp.id)).toEqual(stamp);
    expect(savedPhotoFiles()).toHaveLength(filesBefore);
  });

  test("changes nothing and leaves no new file when the db write fails", async () => {
    const stamp = await savePhotoStamp(907, 2);
    const filesBefore = savedPhotoFiles().length;
    const db = await withAppDb();
    const runInTransaction = db.withExclusiveTransactionAsync;
    // The new photo rows fail to insert inside the transaction.
    const spy = jest
      .spyOn(db, "withExclusiveTransactionAsync")
      .mockImplementation((task) =>
        runInTransaction((txn) =>
          task({
            ...txn,
            runAsync: (source: string, ...params: never[]) =>
              source.startsWith("INSERT INTO stamp_photos")
                ? Promise.reject(new Error("disk full"))
                : txn.runAsync(source, ...params),
          } as typeof txn),
        ),
      );

    try {
      await expect(
        updateStamp({
          id: stamp.id,
          stampedAt: localDay(11),
          memo: "Changed",
          keptPhotoIds: [stamp.photos[1].id],
          newPhotoUris: [pickPhoto()],
        }),
      ).rejects.toThrow("disk full");
    } finally {
      spy.mockRestore();
    }

    expect(await findListed(stamp.id)).toEqual(stamp);
    expect(
      stamp.photos.every(({ fileName }) => photoFileExists(fileName)),
    ).toBe(true);
    expect(savedPhotoFiles()).toHaveLength(filesBefore);
  });
});

describe("S-037 T-005 ST-002 small copies for the album", () => {
  test("keeps a small re-encoded copy beside each saved photo", async () => {
    const saved = await saveStamp({ rallyId: 501 });
    const pickedUri = pickPhoto();

    const {
      photos: [photo],
    } = await updateStampMemo({
      id: saved.id,
      memo: "",
      photoUris: [pickedUri],
    });

    const thumbUri = stampPhotoThumbUri(photo.fileName);
    expect(thumbUri).not.toBe(stampPhotoUri(photo.fileName));
    // The mock's picked photo is 4000 x 3000, so the short side is the height.
    expect(new File(thumbUri).textSync()).toBe(
      `re-encoded:${pickedUri}:resized:{"height":400}`,
    );
    expect(new File(stampPhotoUri(photo.fileName)).textSync()).toBe(
      `re-encoded:${pickedUri}`,
    );
  });

  test("removes the small copy with the photo", async () => {
    const saved = await saveStamp({ rallyId: 502 });
    const {
      photos: [photo],
    } = await updateStampMemo({
      id: saved.id,
      memo: "",
      photoUris: [pickPhoto()],
    });
    const thumbUri = stampPhotoThumbUri(photo.fileName);
    expect(new File(thumbUri).exists).toBe(true);
    const thumbsBefore = savedThumbFiles().length;

    await deleteStamp(saved.id);

    expect(new File(thumbUri).exists).toBe(false);
    expect(new File(stampPhotoUri(photo.fileName)).exists).toBe(false);
    expect(savedThumbFiles()).toHaveLength(thumbsBefore - 1);
  });

  test("falls back to the photo itself when it has no small copy", () => {
    expect(stampPhotoThumbUri("saved-before-thumbs.jpg")).toBe(
      stampPhotoUri("saved-before-thumbs.jpg"),
    );
  });
});
