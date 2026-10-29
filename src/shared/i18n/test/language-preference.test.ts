import Storage from "expo-sqlite/kv-store";

import { i18n } from "..";
import {
  applyLanguagePreference,
  initialLanguage,
  readLanguagePreference,
} from "../language-preference";

beforeEach(() => {
  Storage.clearSync();
});

describe("S-045 ST-002 language preference", () => {
  test("follows the device when nothing is saved", () => {
    expect(readLanguagePreference()).toBe("system");
    // Jest's device is en-US.
    expect(initialLanguage()).toBe("en");
  });

  test("a saved choice is used the next time the app starts", async () => {
    await applyLanguagePreference("ja");

    expect(readLanguagePreference()).toBe("ja");
    expect(initialLanguage()).toBe("ja");
  });

  test("an unknown saved value falls back to the device", () => {
    Storage.setItemSync("app.language", "fr");

    expect(readLanguagePreference()).toBe("system");
    expect(initialLanguage()).toBe("en");
  });

  test("choosing a language switches the app at once", async () => {
    await applyLanguagePreference("ja");
    expect(i18n.language).toBe("ja");

    await applyLanguagePreference("system");
    expect(i18n.language).toBe("en");
    expect(readLanguagePreference()).toBe("system");
  });
});
