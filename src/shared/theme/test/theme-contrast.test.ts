import { readFileSync } from "fs";
import { join } from "path";

// The light variant's colors as declared in tailwind.css.
function lightColors() {
  const css = readFileSync(join(process.cwd(), "tailwind.css"), "utf8");
  const light = css.split("@variant light")[1].split("@variant dark")[0];
  return Object.fromEntries(
    [...light.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{6})/g)].map(
      ([, name, hex]) => [name, hex],
    ),
  );
}

// WCAG 2 relative luminance and contrast ratio.
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((index) => {
    const channel = parseInt(hex.slice(index, index + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground: string, background: string) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

describe("S-033 T-002 ST-001 muted text contrast", () => {
  test.each(["canvas", "surface", "surface-muted", "accent-subtle"])(
    "keeps light muted text at 4.5:1 or more on %s",
    (background) => {
      const colors = lightColors();

      expect(
        contrast(colors["foreground-muted"], colors[background]),
      ).toBeGreaterThanOrEqual(4.5);
    },
  );
});
