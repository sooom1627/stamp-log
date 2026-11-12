import { type ComponentRef, type ReactNode, type Ref } from "react";

import { Text, View } from "react-native";

import { ScopedTheme } from "uniwind";

import { AtoMark } from "./ato-mark";

// Share images are laid out at 360 × 450 pt and written at 3× as 1080 × 1350 px
// (DESIGN.md Components 共有の画像).
export const shareImageWidth = 360;
export const shareImageHeight = 450;

type ShareImageFrameProps = {
  ref?: Ref<ComponentRef<typeof View>>;
  /** The word in the card's head, e.g. `Rally` or `October`. */
  label: string;
  /** The note on the right of the head, e.g. the date span or the year. */
  detail: string;
  /** What VoiceOver reads for the whole image. */
  "aria-label": string;
  children: ReactNode;
};

// The frame every share image uses: the tab canvas, one white card with the
// card head, and the Ato mark below. Only the card's content differs. It is
// drawn with the light values whatever the device theme.
export function ShareImageFrame({
  ref,
  label,
  detail,
  "aria-label": ariaLabel,
  children,
}: ShareImageFrameProps) {
  return (
    <ScopedTheme theme="light">
      <View
        ref={ref}
        testID="share-image"
        role="img"
        aria-label={ariaLabel}
        // A captured view must be a real native view.
        collapsable={false}
        style={{ width: shareImageWidth, height: shareImageHeight }}
        className="bg-canvas from-canvas-top via-canvas-mid to-canvas-bottom gap-3 bg-linear-to-b p-6"
      >
        <View className="border-continuous bg-surface rounded-card flex-1 gap-4 overflow-hidden p-5">
          <View className="flex-row items-center gap-2">
            <View className="bg-foreground size-2 rounded-full" />
            <Text className="text-foreground text-footnote font-semibold">
              {label}
            </Text>
            <Text className="text-foreground-muted text-footnote ml-auto">
              {detail}
            </Text>
          </View>
          {children}
        </View>
        <View className="flex-row items-center gap-1">
          <AtoMark size={20} />
          <Text className="text-foreground text-subhead font-bold">Ato</Text>
          <Text className="text-foreground-muted text-caption2 ml-auto">
            {"Look back. It's all there."}
          </Text>
        </View>
      </View>
    </ScopedTheme>
  );
}
