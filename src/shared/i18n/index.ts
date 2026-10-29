import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { initialLanguage } from "./language-preference";
import { en } from "./locales/en";
import { ja } from "./locales/ja";

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ja: { translation: ja } },
  lng: initialLanguage(),
  fallbackLng: "en",
  // Resources are bundled, so init synchronously and render the first frame in
  // the right language.
  initAsync: false,
  // React already escapes rendered text.
  interpolation: { escapeValue: false },
});

export { i18n };
