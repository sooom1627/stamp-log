import { Directory, File, Paths } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

import { type StampPhoto } from "../schemas/stamps";

// Saved photos live under the documents folder. The db keeps only the file
// name, because the app's absolute path can change on iOS.
function photosDirectory() {
  return new Directory(Paths.document, "stamp-photos");
}

// The album's small copies (S-037 T-005), under the photo's file name, so the
// db needs no column for them.
function thumbsDirectory() {
  return new Directory(Paths.document, "stamp-photo-thumbs");
}

// The short side of a small copy, in pixels: enough for a third of the
// screen width on a 3x display.
const THUMB_SHORT_SIDE = 400;

export function stampPhotoUri(fileName: StampPhoto["fileName"]) {
  return new File(photosDirectory(), fileName).uri;
}

// Photos saved before small copies existed have none; they show the photo.
export function stampPhotoThumbUri(fileName: StampPhoto["fileName"]) {
  const thumb = new File(thumbsDirectory(), fileName);
  return thumb.exists ? thumb.uri : stampPhotoUri(fileName);
}

// Re-encodes the picked photo instead of copying it, so the saved copy keeps
// no EXIF (location and the like). The photo in the library is not changed.
export async function writeStampPhoto(sourceUri: string) {
  const image = await ImageManipulator.manipulate(sourceUri).renderAsync();
  const { uri } = await image.saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.8,
  });
  const directory = photosDirectory();
  directory.create({ intermediates: true, idempotent: true });
  const file = new File(uri);
  await file.move(directory);
  await writeStampPhotoThumb(sourceUri, image, file.name);
  return file.name;
}

// Best effort: without a small copy the album shows the photo itself, so a
// failure here does not fail the save. A small photo is not copied.
async function writeStampPhotoThumb(
  sourceUri: string,
  { width, height }: { width: number; height: number },
  fileName: StampPhoto["fileName"],
) {
  if (Math.min(width, height) <= THUMB_SHORT_SIDE) return;
  try {
    const size =
      width < height
        ? { width: THUMB_SHORT_SIDE }
        : { height: THUMB_SHORT_SIDE };
    const thumb = await ImageManipulator.manipulate(sourceUri)
      .resize(size)
      .renderAsync();
    const { uri } = await thumb.saveAsync({
      format: SaveFormat.JPEG,
      compress: 0.8,
    });
    const directory = thumbsDirectory();
    directory.create({ intermediates: true, idempotent: true });
    await new File(uri).move(new File(directory, fileName));
  } catch {
    // The album falls back to the photo.
  }
}

// Best effort: a file left behind is only unused space, and the db change it
// follows is already saved, so a failed delete is not reported.
export function deleteStampPhotoFiles(fileNames: StampPhoto["fileName"][]) {
  for (const fileName of fileNames) {
    try {
      const file = new File(photosDirectory(), fileName);
      if (file.exists) file.delete();
      const thumb = new File(thumbsDirectory(), fileName);
      if (thumb.exists) thumb.delete();
    } catch {
      // Keep removing the rest.
    }
  }
}
