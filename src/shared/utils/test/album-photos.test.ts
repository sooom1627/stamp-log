import { stampPhotoUri } from "@/shared/db/stamp-photo-files";
import { type Rally } from "@/shared/schemas/rallies";
import { type Stamp } from "@/shared/schemas/stamps";

import { albumTiles, dayRallyPhotos } from "../album-photos";

const lab: Rally = {
  id: 1,
  name: "Researchers",
  emoji: "🔬",
  isFavorite: false,
  isArchived: false,
};
const cafe: Rally = {
  id: 2,
  name: "Cafes",
  emoji: "☕",
  isFavorite: false,
  isArchived: false,
};

function photo(id: number, stampId: number, position: number) {
  return { id, stampId, fileName: `photo-${id}.jpg`, position };
}

// Local times, so each stamp falls on the day the test names.
function localIso(day: number, hour: number) {
  return new Date(2026, 9, day, hour).toISOString();
}

const morning: Stamp = {
  id: 20,
  rallyId: lab.id,
  stampedAt: localIso(10, 9),
  memo: null,
  photos: [photo(202, 20, 1), photo(201, 20, 0)],
};
// A second stamp of the same rally on the same day (older data, S-026).
const evening: Stamp = {
  id: 21,
  rallyId: lab.id,
  stampedAt: localIso(10, 20),
  memo: null,
  photos: [photo(211, 21, 0)],
};
const cafeSameDay: Stamp = {
  id: 22,
  rallyId: cafe.id,
  stampedAt: localIso(10, 12),
  memo: null,
  photos: [photo(221, 22, 0)],
};
const labNextDay: Stamp = {
  id: 23,
  rallyId: lab.id,
  stampedAt: localIso(11, 8),
  memo: null,
  photos: [photo(231, 23, 0)],
};
const labNoPhotos: Stamp = {
  id: 24,
  rallyId: lab.id,
  stampedAt: localIso(12, 8),
  memo: null,
  photos: [],
};

describe("S-037 T-003 ST-002 albumTiles", () => {
  const stamps = [labNoPhotos, labNextDay, evening, cafeSameDay, morning];

  test("makes one tile per day and rally, newest day first", () => {
    const tiles = albumTiles(stamps, [lab, cafe]);

    expect(
      tiles.map(({ rallyName, photoCount }) => [rallyName, photoCount]),
    ).toEqual([
      ["Researchers", 1],
      // Same day: the tile whose last stamp is newer comes first.
      ["Researchers", 3],
      ["Cafes", 1],
    ]);
  });

  test("covers a tile with its first photo, from the day's oldest stamp", () => {
    const [, labDay] = albumTiles(stamps, [lab, cafe]);

    expect(labDay).toEqual({
      key: `2026-10-10-${lab.id}`,
      coverPhotoId: 201,
      coverUri: stampPhotoUri("photo-201.jpg"),
      photoCount: 3,
      emoji: "🔬",
      rallyName: "Researchers",
      stampedAt: morning.stampedAt,
    });
  });

  test("keeps only one rally's tiles when a rally is given", () => {
    const tiles = albumTiles(stamps, [lab, cafe], lab.id);

    expect(tiles.map(({ coverPhotoId }) => coverPhotoId)).toEqual([231, 201]);
  });

  test("returns nothing when no stamp has photos", () => {
    expect(albumTiles([labNoPhotos], [lab, cafe])).toEqual([]);
  });
});

describe("S-037 T-003 ST-002 dayRallyPhotos", () => {
  const stamps = [labNextDay, evening, cafeSameDay, morning];

  test("lists the photos of the same day and rally, oldest stamp first", () => {
    const photos = dayRallyPhotos(stamps, 211);

    expect(photos.map(({ id }) => id)).toEqual([201, 202, 211]);
    expect(photos[0]).toEqual({
      id: 201,
      uri: stampPhotoUri("photo-201.jpg"),
      stampedAt: morning.stampedAt,
      rallyId: lab.id,
    });
    expect(photos[2].stampedAt).toBe(evening.stampedAt);
  });

  test("leaves out other rallies and other days", () => {
    expect(dayRallyPhotos(stamps, 221).map(({ id }) => id)).toEqual([221]);
    expect(dayRallyPhotos(stamps, 231).map(({ id }) => id)).toEqual([231]);
  });

  test("returns nothing for a photo that does not exist", () => {
    expect(dayRallyPhotos(stamps, 999)).toEqual([]);
  });
});
