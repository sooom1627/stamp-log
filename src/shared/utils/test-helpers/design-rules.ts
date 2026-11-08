import type { screen } from "@testing-library/react-native";

type HostElement = ReturnType<typeof screen.getByTestId>;

// Class names off DESIGN.md's scales (S-060): half-step or hard-coded
// spacing, Tailwind's type sizes instead of the iOS ones, medium weight, and
// card corners other than rounded-card. Emoji are pictures and keep their own
// sizes, so a text that is only emoji is skipped, and so are text-xl and
// text-4xl. The text-* tokens set only size and line height, so a headline
// without font-semibold is off the scale too.
const OFF_SCALE = [
  /^-?(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y)-(\d+\.5|\[[^\]]+\])$/,
  /^text-(xs|sm|base|lg|2xl|3xl|\[[0-9.]+px\])$/,
  /^font-medium$/,
  /^rounded-(3xl|\[[^\]]+\])$/,
];

function isEmojiOnly(children: unknown) {
  return (
    typeof children === "string" &&
    /\p{Extended_Pictographic}/u.test(children) &&
    !/[\p{L}\p{N}]/u.test(children)
  );
}

function offScaleNamesOf(names: string[]) {
  const offScale = names.filter((name) =>
    OFF_SCALE.some((pattern) => pattern.test(name)),
  );
  return names.includes("text-headline") && !names.includes("font-semibold")
    ? [...offScale, "text-headline without font-semibold"]
    : offScale;
}

export function offScaleClassNames(root: HostElement) {
  return root
    .queryAll(
      (instance) =>
        (typeof instance.props.className === "string" ||
          typeof instance.props.contentContainerClassName === "string") &&
        !isEmojiOnly(instance.props.children),
    )
    .flatMap((instance) =>
      offScaleNamesOf(
        [instance.props.className, instance.props.contentContainerClassName]
          .filter((value): value is string => typeof value === "string")
          .join(" ")
          .split(/\s+/),
      ),
    );
}
