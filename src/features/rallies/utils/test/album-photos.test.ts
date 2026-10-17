import { stampPhotoUri } from "../../db/stamp-photo-files";
import { type Rally } from "../../schemas/rallies";
import { type Stamp } from "../../schemas/stamps";
import { albumPhotos } from "../album-photos";

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

const older: Stamp = {
  id: 10,
  rallyId: lab.id,
  stampedAt: "2026-10-08T10:00:00.000Z",
  memo: null,
  // Out of position order on purpose.
  photos: [photo(102, 10, 1), photo(101, 10, 0)],
};
const newer: Stamp = {
  id: 11,
  rallyId: cafe.id,
  stampedAt: "2026-10-10T10:00:00.000Z",
  memo: null,
  photos: [photo(111, 11, 0)],
};
const withoutPhotos: Stamp = {
  id: 12,
  rallyId: lab.id,
  stampedAt: "2026-10-12T10:00:00.000Z",
  memo: "no photos",
  photos: [],
};

describe("S-037 T-002 ST-001 albumPhotos", () => {
  test("lists photos from the newest stamp, each stamp's in position order", () => {
    const photos = albumPhotos([older, withoutPhotos, newer], [lab, cafe]);

    expect(photos.map(({ id }) => id)).toEqual([111, 101, 102]);
  });

  test("gives each photo its file URI and its stamp's rally and date", () => {
    const [first] = albumPhotos([newer], [lab, cafe]);

    expect(first).toEqual({
      id: 111,
      uri: stampPhotoUri("photo-111.jpg"),
      emoji: "☕",
      rallyName: "Cafes",
      stampedAt: newer.stampedAt,
    });
  });

  test("keeps only one rally's photos when a rally is given", () => {
    const photos = albumPhotos([older, newer], [lab, cafe], lab.id);

    expect(photos.map(({ id }) => id)).toEqual([101, 102]);
  });

  test("returns nothing when no stamp has photos", () => {
    expect(albumPhotos([withoutPhotos], [lab, cafe])).toEqual([]);
  });
});
