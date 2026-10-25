import { useId } from "react";

import { View } from "react-native";

import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Mask,
  Rect,
  Stop,
} from "react-native-svg";
import { useCSSVariable } from "uniwind";

// The three cuts across the sun, before the -14° turn (S-049, 100 x 100 grid).
const cutYs = [57, 63.5, 70];

// The Ato mark: the app icon's sun without its tile, for the header and the
// onboarding. The bands follow the theme.
export function AtoMark({ size }: { size: number }) {
  const id = useId();
  const sunFrom = useCSSVariable("--color-mark-sun-from") as string;
  const sunTo = useCSSVariable("--color-mark-sun-to") as string;
  const bandFrom = useCSSVariable("--color-mark-band-from") as string;
  const bandTo = useCSSVariable("--color-mark-band-to") as string;

  return (
    <View role="img" aria-label="Ato">
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient
            id={`${id}-sun`}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="24"
            x2="0"
            y2="76"
          >
            <Stop offset="0" stopColor={sunFrom} />
            <Stop offset="1" stopColor={sunTo} />
          </LinearGradient>
          <LinearGradient
            id={`${id}-band`}
            gradientUnits="userSpaceOnUse"
            x1="25"
            y1="20"
            x2="75"
            y2="80"
          >
            <Stop offset="0" stopColor={bandFrom} />
            <Stop offset="1" stopColor={bandTo} />
          </LinearGradient>
          <ClipPath id={`${id}-clip`}>
            <Circle cx="50" cy="50" r="26" />
          </ClipPath>
          <Mask id={`${id}-cuts`}>
            <Rect width="100" height="100" fill="#fff" />
            <G transform="rotate(-14 50 50)">
              {cutYs.map((y) => (
                <Rect
                  key={y}
                  x="0"
                  y={y}
                  width="100"
                  height="3.1"
                  fill="#000"
                />
              ))}
            </G>
          </Mask>
        </Defs>
        <G clipPath={`url(#${id}-clip)`} mask={`url(#${id}-cuts)`}>
          <Rect width="100" height="100" fill={`url(#${id}-sun)`} />
          <G transform="rotate(-14 50 50)">
            <Rect
              x="0"
              y="60.1"
              width="100"
              height="50"
              fill={`url(#${id}-band)`}
            />
          </G>
        </G>
      </Svg>
    </View>
  );
}
