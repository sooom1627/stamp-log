export type AppLanguage = "en" | "ja";

// Japanese for a Japanese device, English for every other language.
export function resolveLanguage(
  languageCode: string | null | undefined,
): AppLanguage {
  return languageCode === "ja" ? "ja" : "en";
}
