// Jest replaces `expo-image-manipulator` (native). Saving writes a new file to
// the cache whose content names its source, standing in for a re-encoded JPEG
// (re-encoding is what drops EXIF; that part is only checked on a device).
import { Directory, File, Paths } from "expo-file-system";

export enum SaveFormat {
  JPEG = "jpeg",
  PNG = "png",
  WEBP = "webp",
}

let nextImageId = 1;

export const ImageManipulator = {
  manipulate: (source: string) => ({
    renderAsync: async () => {
      // Reading the source fails like the native module when it is missing.
      new File(source).textSync();
      return {
        saveAsync: async (_options?: {
          format?: SaveFormat;
          compress?: number;
        }) => {
          const directory = new Directory(Paths.cache, "ImageManipulator");
          directory.create({ intermediates: true, idempotent: true });
          const file = new File(directory, `image-${nextImageId++}.jpg`);
          file.write(`re-encoded:${source}`);
          return { uri: file.uri, width: 1, height: 1 };
        },
      };
    },
  }),
};
