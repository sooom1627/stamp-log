import { type SQLiteDatabase } from "expo-sqlite";

import {
  hasStampOnLocalDay,
  maxStampPhotos,
  sameDayStampMessage,
  saveStampInputSchema,
  stampSchema,
  updateStampInputSchema,
  updateStampMemoInputSchema,
  type SaveStampInput,
  type Stamp,
  type StampPhoto,
  type UpdateStampInput,
  type UpdateStampMemoInput,
} from "../schemas/stamps";

import { withAppDb } from "./schema";
import { deleteStampPhotoFiles, writeStampPhoto } from "./stamp-photo-files";

// A row of the stamps table. Its photos live in stamp_photos.
type StampRow = Omit<Stamp, "photos">;

const stampColumns = "id, rally_id AS rallyId, stamped_at AS stampedAt, memo";
const photoColumns = "id, stamp_id AS stampId, file_name AS fileName, position";

async function listPhotos(db: SQLiteDatabase, stampId?: Stamp["id"]) {
  if (stampId === undefined) {
    return db.getAllAsync<StampPhoto>(
      `SELECT ${photoColumns} FROM stamp_photos ORDER BY stamp_id, position`,
    );
  }
  return db.getAllAsync<StampPhoto>(
    `SELECT ${photoColumns} FROM stamp_photos WHERE stamp_id = ? ORDER BY position`,
    stampId,
  );
}

// `photos` are this stamp's, in position order.
function withPhotos(row: StampRow, photos: StampPhoto[]) {
  return stampSchema.parse({ ...row, photos });
}

async function findStamp(db: SQLiteDatabase, id: Stamp["id"]) {
  const row = await db.getFirstAsync<StampRow>(
    `SELECT ${stampColumns} FROM stamps WHERE id = ?`,
    id,
  );
  if (!row) {
    throw new Error("Stamp not found");
  }
  return withPhotos(row, await listPhotos(db, id));
}

async function assertNoStampOnLocalDay(
  db: SQLiteDatabase,
  target: Parameters<typeof hasStampOnLocalDay>[1],
) {
  const stamps = await db.getAllAsync<StampRow>(
    `SELECT ${stampColumns} FROM stamps WHERE rally_id = ?`,
    target.rallyId,
  );
  if (hasStampOnLocalDay(stamps, target)) {
    throw new Error(sameDayStampMessage);
  }
}

export async function saveStamp(input: SaveStampInput): Promise<Stamp> {
  const parsed = saveStampInputSchema.parse(input);
  const { rallyId } = parsed;
  const stampedAt = parsed.stampedAt ?? new Date().toISOString();
  const db = await withAppDb();
  if (parsed.stampedAt !== undefined) {
    await assertNoStampOnLocalDay(db, { rallyId, date: new Date(stampedAt) });
  }
  const result = await db.runAsync(
    "INSERT INTO stamps (rally_id, stamped_at) VALUES (?, ?)",
    rallyId,
    stampedAt,
  );
  return stampSchema.parse({
    id: result.lastInsertRowId,
    rallyId,
    stampedAt,
    memo: null,
    photos: [],
  });
}

export async function listStamps(): Promise<Stamp[]> {
  const db = await withAppDb();
  const rows = await db.getAllAsync<StampRow>(
    `SELECT ${stampColumns} FROM stamps ORDER BY stamped_at DESC, id DESC`,
  );
  const photosByStampId = new Map<Stamp["id"], StampPhoto[]>();
  for (const photo of await listPhotos(db)) {
    const photos = photosByStampId.get(photo.stampId);
    if (photos) photos.push(photo);
    else photosByStampId.set(photo.stampId, [photo]);
  }
  return rows.map((row) => withPhotos(row, photosByStampId.get(row.id) ?? []));
}

// Photos are written before the db so a failed write leaves the stamp as it
// was; files written for a failed save are removed again.
async function saveWithNewPhotos(
  photoUris: string[],
  save: (fileNames: StampPhoto["fileName"][]) => Promise<void>,
) {
  const fileNames: StampPhoto["fileName"][] = [];
  try {
    for (const photoUri of photoUris) {
      fileNames.push(await writeStampPhoto(photoUri));
    }
    await save(fileNames);
  } catch (error) {
    deleteStampPhotoFiles(fileNames);
    throw error;
  }
}

async function insertPhotos(
  txn: SQLiteDatabase,
  stampId: Stamp["id"],
  fileNames: StampPhoto["fileName"][],
  firstPosition: number,
) {
  for (const [index, fileName] of fileNames.entries()) {
    await txn.runAsync(
      "INSERT INTO stamp_photos (stamp_id, file_name, position) VALUES (?, ?, ?)",
      stampId,
      fileName,
      firstPosition + index,
    );
  }
}

export async function updateStampMemo(
  input: UpdateStampMemoInput,
): Promise<Stamp> {
  const { id, memo, photoUris } = updateStampMemoInputSchema.parse(input);
  const db = await withAppDb();
  const current = await findStamp(db, id);
  if (current.photos.length + photoUris.length > maxStampPhotos) {
    throw new Error(`A stamp can have up to ${maxStampPhotos} photos`);
  }

  await saveWithNewPhotos(photoUris, (fileNames) =>
    db.withExclusiveTransactionAsync(async (txn) => {
      if (memo !== null) {
        await txn.runAsync("UPDATE stamps SET memo = ? WHERE id = ?", memo, id);
      }
      await insertPhotos(txn, id, fileNames, current.photos.length);
    }),
  );
  return findStamp(db, id);
}

// Same order as updateStampMemo for new photos, and as deleteStamp for
// dropped ones: their files go only after the db change is saved.
export async function updateStamp(input: UpdateStampInput): Promise<Stamp> {
  const { id, stampedAt, memo, keptPhotoIds, newPhotoUris } =
    updateStampInputSchema.parse(input);
  const db = await withAppDb();
  const current = await findStamp(db, id);
  await assertNoStampOnLocalDay(db, {
    rallyId: current.rallyId,
    date: new Date(stampedAt),
    excludedId: id,
  });
  // Only this stamp's photos count; ids of other stamps' photos are ignored.
  const keptPhotos = current.photos.filter((photo) =>
    keptPhotoIds.includes(photo.id),
  );
  const droppedPhotos = current.photos.filter(
    (photo) => !keptPhotoIds.includes(photo.id),
  );

  await saveWithNewPhotos(newPhotoUris, (newFileNames) =>
    db.withExclusiveTransactionAsync(async (txn) => {
      await txn.runAsync(
        "UPDATE stamps SET stamped_at = ?, memo = ? WHERE id = ?",
        stampedAt,
        memo,
        id,
      );
      for (const { id: photoId } of droppedPhotos) {
        await txn.runAsync("DELETE FROM stamp_photos WHERE id = ?", photoId);
      }
      for (const [position, { id: photoId }] of keptPhotos.entries()) {
        await txn.runAsync(
          "UPDATE stamp_photos SET position = ? WHERE id = ?",
          position,
          photoId,
        );
      }
      await insertPhotos(txn, id, newFileNames, keptPhotos.length);
    }),
  );
  deleteStampPhotoFiles(droppedPhotos.map(({ fileName }) => fileName));
  return findStamp(db, id);
}

// The db goes first: if it fails the files stay, so no row points to a missing
// photo. Files are removed only after the delete is saved.
export async function deleteStamp(id: Stamp["id"]): Promise<void> {
  const db = await withAppDb();
  let photos: StampPhoto[] = [];
  await db.withExclusiveTransactionAsync(async (txn) => {
    photos = await listPhotos(txn, id);
    await txn.runAsync("DELETE FROM stamp_photos WHERE stamp_id = ?", id);
    await txn.runAsync("DELETE FROM stamps WHERE id = ?", id);
  });
  deleteStampPhotoFiles(photos.map(({ fileName }) => fileName));
}

// Runs in the caller's transaction, so deleting a rally and its stamps
// succeeds or fails as one. Returns the photo files for the caller to remove
// once the transaction is saved.
export async function deleteRallyStamps(
  txn: SQLiteDatabase,
  rallyId: Stamp["rallyId"],
): Promise<StampPhoto["fileName"][]> {
  const rallyStamps = "SELECT id FROM stamps WHERE rally_id = ?";
  const photos = await txn.getAllAsync<Pick<StampPhoto, "fileName">>(
    `SELECT file_name AS fileName FROM stamp_photos WHERE stamp_id IN (${rallyStamps}) ORDER BY stamp_id, position`,
    rallyId,
  );
  await txn.runAsync(
    `DELETE FROM stamp_photos WHERE stamp_id IN (${rallyStamps})`,
    rallyId,
  );
  await txn.runAsync("DELETE FROM stamps WHERE rally_id = ?", rallyId);
  return photos.map(({ fileName }) => fileName);
}
