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

// Every picked photo stands in for a 4000 x 3000 (landscape) image.
const sourceSize = { width: 4000, height: 3000 };

type ResizeSize = { width?: number | null; height?: number | null };

function context(source: string, resized?: ResizeSize) {
  return {
    // A resized save names the size it was asked for after its source.
    resize: (size: ResizeSize) => context(source, size),
    renderAsync: async () => {
      // Reading the source fails like the native module when it is missing.
      new File(source).textSync();
      return {
        ...sourceSize,
        saveAsync: async (_options?: {
          format?: SaveFormat;
          compress?: number;
        }) => {
          const directory = new Directory(Paths.cache, "ImageManipulator");
          directory.create({ intermediates: true, idempotent: true });
          const file = new File(directory, `image-${nextImageId++}.jpg`);
          file.writeSync(
            resized
              ? `re-encoded:${source}:resized:${JSON.stringify(resized)}`
              : `re-encoded:${source}`,
          );
          return { uri: file.uri, width: 1, height: 1 };
        },
      };
    },
  };
}

export const ImageManipulator = {
  manipulate: (source: string) => context(source),
};
