import { stampPhotoUri } from "../db/stamp-photo-files";
import { type Rally } from "../schemas/rallies";
import { type Stamp } from "../schemas/stamps";

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
