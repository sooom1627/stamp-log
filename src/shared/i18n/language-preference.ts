import { getLocales } from "expo-localization";
import Storage from "expo-sqlite/kv-store";

import i18n from "i18next";
import { z } from "zod";

import { resolveLanguage, type AppLanguage } from "./resolve-language";

// A device setting, not app data: kept out of the app database, so export and
// import never carry it. Read synchronously so the first screen is already in
// the chosen language.
const languageKey = "app.language";

export const languagePreferenceSchema = z.enum(["system", "en", "ja"]);
export type LanguagePreference = z.infer<typeof languagePreferenceSchema>;

export function readLanguagePreference(): LanguagePreference {
  const parsed = languagePreferenceSchema.safeParse(
    Storage.getItemSync(languageKey),
  );
  return parsed.success ? parsed.data : "system";
}

function languageFor(preference: LanguagePreference): AppLanguage {
  if (preference !== "system") return preference;
  return resolveLanguage(getLocales()[0]?.languageCode);
}

export function initialLanguage(): AppLanguage {
  return languageFor(readLanguagePreference());
}

export async function applyLanguagePreference(
  preference: LanguagePreference,
): Promise<void> {
  Storage.setItemSync(languageKey, preference);
  await i18n.changeLanguage(languageFor(preference));
}
