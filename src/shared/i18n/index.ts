import { getLocales } from "expo-localization";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { en } from "./locales/en";
import { ja } from "./locales/ja";
import { resolveLanguage } from "./resolve-language";

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ja: { translation: ja } },
  lng: resolveLanguage(getLocales()[0]?.languageCode),
  fallbackLng: "en",
  // Resources are bundled, so init synchronously and render the first frame in
  // the right language.
  initAsync: false,
  // React already escapes rendered text.
  interpolation: { escapeValue: false },
});

export { i18n };
