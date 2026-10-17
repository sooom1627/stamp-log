import { localDateKeyFromIso } from "@/shared/utils/local-date-key";

import { stampPhotoUri } from "../db/stamp-photo-files";
import { type Rally } from "../schemas/rallies";
import { type Stamp, type StampPhoto } from "../schemas/stamps";

export type AlbumPhoto = {
  id: number;
  uri: string;
  emoji: Rally["emoji"];
  rallyName: Rally["name"];
  stampedAt: Stamp["stampedAt"];
};

// The Album grid (S-037): every photo, newest stamp first and each stamp's
// photos in the order they were attached. Given a rally, only its photos.
export function albumPhotos(
  stamps: Stamp[],
  rallies: Rally[],
  rallyId?: Rally["id"],
): AlbumPhoto[] {
  const ralliesById = new Map(rallies.map((rally) => [rally.id, rally]));

  return stamps
    .filter((stamp) => rallyId === undefined || stamp.rallyId === rallyId)
    .sort((a, b) => Date.parse(b.stampedAt) - Date.parse(a.stampedAt))
    .flatMap((stamp) => {
      const rally = ralliesById.get(stamp.rallyId);
      if (!rally) return [];
      // Copy before sorting: the stamps come from the query cache.
      return [...stamp.photos]
        .sort((a, b) => a.position - b.position)
        .map((photo) => ({
          id: photo.id,
          uri: stampPhotoUri(photo.fileName),
          emoji: rally.emoji,
          rallyName: rally.name,
          stampedAt: stamp.stampedAt,
        }));
    });
}

export type AlbumTile = {
  key: string;
  coverPhotoId: StampPhoto["id"];
  coverUri: string;
  photoCount: number;
  emoji: Rally["emoji"];
  rallyName: Rally["name"];
  stampedAt: Stamp["stampedAt"];
};

const byOldest = (a: Stamp, b: Stamp) =>
  Date.parse(a.stampedAt) - Date.parse(b.stampedAt) || a.id - b.id;

// Copy before sorting: the stamps come from the query cache.
const photosInOrder = (stamp: Stamp) =>
  [...stamp.photos].sort((a, b) => a.position - b.position);

const dayRallyKey = (stamp: Stamp) =>
  `${localDateKeyFromIso(stamp.stampedAt)}-${stamp.rallyId}`;

// The Album as tiles (S-037 T-003): one per local day and rally, covered with
// its first photo. Newest day first; on one day, the tile stamped last first.
export function albumTiles(
  stamps: Stamp[],
  rallies: Rally[],
  rallyId?: Rally["id"],
): AlbumTile[] {
  const ralliesById = new Map(rallies.map((rally) => [rally.id, rally]));
  const groups = new Map<string, Stamp[]>();
  for (const stamp of [...stamps].sort(byOldest)) {
    if (rallyId !== undefined && stamp.rallyId !== rallyId) continue;
    if (stamp.photos.length === 0) continue;
    const key = dayRallyKey(stamp);
    const group = groups.get(key);
    if (group) group.push(stamp);
    else groups.set(key, [stamp]);
  }

  return (
    [...groups.entries()]
      // Each group is oldest first, so its last stamp is its newest.
      .sort(([, a], [, b]) => byOldest(b[b.length - 1], a[a.length - 1]))
      .flatMap(([key, group]) => {
        const rally = ralliesById.get(group[0].rallyId);
        if (!rally) return [];
        const [cover] = photosInOrder(group[0]);
        return [
          {
            key,
            coverPhotoId: cover.id,
            coverUri: stampPhotoUri(cover.fileName),
            photoCount: group.reduce(
              (sum, { photos }) => sum + photos.length,
              0,
            ),
            emoji: rally.emoji,
            rallyName: rally.name,
            stampedAt: group[0].stampedAt,
          },
        ];
      })
  );
}

export type DayRallyPhoto = {
  id: StampPhoto["id"];
  uri: string;
  stampedAt: Stamp["stampedAt"];
  rallyId: Rally["id"];
};

// What the photo viewer pages through (S-037 T-003): the photos of every stamp
// on the same local day and rally as `photoId`, oldest stamp first.
export function dayRallyPhotos(
  stamps: Stamp[],
  photoId: StampPhoto["id"],
): DayRallyPhoto[] {
  const owner = stamps.find(({ photos }) =>
    photos.some(({ id }) => id === photoId),
  );
  if (!owner) return [];
  const key = dayRallyKey(owner);

  return stamps
    .filter((stamp) => dayRallyKey(stamp) === key)
    .sort(byOldest)
    .flatMap((stamp) =>
      photosInOrder(stamp).map((photo) => ({
        id: photo.id,
        uri: stampPhotoUri(photo.fileName),
        stampedAt: stamp.stampedAt,
        rallyId: stamp.rallyId,
      })),
    );
}
