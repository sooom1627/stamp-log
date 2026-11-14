import {
  useRef,
  type ComponentRef,
  type ReactNode,
  type RefObject,
} from "react";

import { useWindowDimensions, View } from "react-native";

import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/button";
import { FormSheetLayout } from "@/shared/components/form-sheet";
import {
  shareImageHeight,
  shareImageWidth,
} from "@/shared/components/share-image-frame";

import { useShareImage } from "../hooks/use-share-image";

// The preview takes this share of the screen width, like the mock's sheet.
const PREVIEW_WIDTH_RATIO = 0.7;

type ShareImageSheetProps = {
  testID: string;
  /** The small line above `Share image` (the rally, or the year). */
  eyebrow: string;
  /** Draws the image into the given ref so Share can capture it. */
  renderImage: (ref: RefObject<ComponentRef<typeof View> | null>) => ReactNode;
  /** Between the preview and Share (the month and year sheets' rally tags). */
  children?: ReactNode;
  /** True when the image has nothing to send. */
  isShareDisabled?: boolean;
};

// The share sheet every share route opens: a preview of the image as it will
// be sent, and Share, which opens the iOS share sheet with it.
export function ShareImageSheet({
  testID,
  eyebrow,
  renderImage,
  children,
  isShareDisabled = false,
}: ShareImageSheetProps) {
  const imageRef = useRef<ComponentRef<typeof View>>(null);
  const { width: windowWidth } = useWindowDimensions();
  const { t } = useTranslation();
  const { mutate: shareImage, isPending: isSharing } = useShareImage();

  const previewWidth = Math.round(windowWidth * PREVIEW_WIDTH_RATIO);
  const scale = previewWidth / shareImageWidth;

  return (
    <FormSheetLayout testID={testID} eyebrow={eyebrow} title={t("share.title")}>
      <View
        style={{ width: previewWidth, height: shareImageHeight * scale }}
        className="border-continuous border-border self-center overflow-hidden rounded-lg border"
      >
        {/* Laid out at full size and shrunk, so the capture keeps every pixel. */}
        <View style={{ transform: [{ scale }], transformOrigin: "top left" }}>
          {renderImage(imageRef)}
        </View>
      </View>
      {children}
      <Button
        label={t("share.share")}
        disabled={isShareDisabled}
        onPress={() => shareImage(imageRef)}
        isLoading={isSharing}
      />
    </FormSheetLayout>
  );
}
