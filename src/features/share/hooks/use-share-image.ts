import { PixelRatio } from "react-native";

import { shareAsync } from "expo-sharing";

import { useMutation } from "@tanstack/react-query";
import { captureRef } from "react-native-view-shot";

// Every share image is 4:5 at 1080 × 1350 px (docs/screens/share-image.md).
const IMAGE_WIDTH_PX = 1080;
const IMAGE_HEIGHT_PX = 1350;

type CaptureTarget = Parameters<typeof captureRef>[0];

// Turns the view into a png and opens the iOS share sheet with it. The share
// sheet resolves the same way whether the image was sent or the sheet closed.
async function shareImage(view: CaptureTarget) {
  // captureRef sizes are in points; divide so the file is exactly 1080 px wide.
  const uri = await captureRef(view, {
    format: "png",
    result: "tmpfile",
    width: IMAGE_WIDTH_PX / PixelRatio.get(),
    height: IMAGE_HEIGHT_PX / PixelRatio.get(),
  });
  await shareAsync(uri, { mimeType: "image/png", UTI: "public.png" });
}

export function useShareImage() {
  return useMutation({ mutationFn: shareImage });
}
