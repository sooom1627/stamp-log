import { Directory, File, Paths } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

import { type StampPhoto } from "../schemas/stamps";

// Saved photos live under the documents folder. The db keeps only the file
// name, because the app's absolute path can change on iOS.
function photosDirectory() {
  return new Directory(Paths.document, "stamp-photos");
}

export function stampPhotoUri(fileName: StampPhoto["fileName"]) {
  return new File(photosDirectory(), fileName).uri;
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
  return file.name;
}

// Best effort: a file left behind is only unused space, and the db change it
// follows is already saved, so a failed delete is not reported.
export function deleteStampPhotoFiles(fileNames: StampPhoto["fileName"][]) {
  for (const fileName of fileNames) {
    try {
      const file = new File(photosDirectory(), fileName);
      if (file.exists) file.delete();
    } catch {
      // Keep removing the rest.
    }
  }
}
