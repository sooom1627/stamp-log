import type { screen } from "@testing-library/react-native";

type HostElement = ReturnType<typeof screen.getByTestId>;

// Class names off DESIGN.md's scales (S-060): half-step or hard-coded
// spacing, Tailwind's type sizes instead of the iOS ones, medium weight, and
// card corners other than rounded-card. Emoji keep their own sizes, so
// text-xl and text-4xl are not checked.
const OFF_SCALE = [
  /^-?(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y)-(\d+\.5|\[[^\]]+\])$/,
  /^text-(xs|sm|base|lg|2xl|3xl)$/,
  /^font-medium$/,
  /^rounded-(3xl|\[[^\]]+\])$/,
];

export function offScaleClassNames(root: HostElement) {
  return root
    .queryAll(
      (instance) =>
        typeof instance.props.className === "string" ||
        typeof instance.props.contentContainerClassName === "string",
    )
    .flatMap((instance) =>
      [instance.props.className, instance.props.contentContainerClassName]
        .filter((value): value is string => typeof value === "string")
        .join(" ")
        .split(/\s+/),
    )
    .filter((name) => OFF_SCALE.some((pattern) => pattern.test(name)));
}
