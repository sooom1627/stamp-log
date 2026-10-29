import { resolveLanguage } from "../resolve-language";

describe("S-045 ST-002 resolve language", () => {
  test.each([
    ["ja", "ja"],
    ["en", "en"],
    ["fr", "en"],
    ["zh", "en"],
    [null, "en"],
    [undefined, "en"],
  ] as const)("%s -> %s", (languageCode, expected) => {
    expect(resolveLanguage(languageCode)).toBe(expected);
  });
});
