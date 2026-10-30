import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, fireEvent, screen } from "@testing-library/react-native";

import { i18n } from "@/shared/i18n";
import {
  applyLanguagePreference,
  readLanguagePreference,
} from "@/shared/i18n/language-preference";

async function openSettings() {
  await renderRouter("./src/app");
  await act(() => {
    router.push("/settings");
  });
}

async function openLanguageSheet() {
  await openSettings();
  await fireEvent.press(
    await screen.findByRole("button", { name: /Language/ }),
  );
  return screen.findByRole("heading", { name: "Language" });
}

describe("S-045 T-003 ST-003 language sheet", () => {
  test("Settings shows the Language row with the current choice", async () => {
    await openSettings();

    expect(await screen.findByText("General")).toBeOnTheScreen();
    expect(
      await screen.findByRole("button", { name: /Language.*Device language/ }),
    ).toBeOnTheScreen();
  });

  test("the sheet lists the choices and checks the current one", async () => {
    expect(await openLanguageSheet()).toBeOnTheScreen();

    expect(
      screen.getByRole("button", { name: "Device language", selected: true }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "English", selected: false }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "日本語", selected: false }),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(
        "The app follows your device's language: Japanese for Japanese, English otherwise.",
      ),
    ).toBeOnTheScreen();
  });

  test("choosing 日本語 switches the app, saves it and closes the sheet", async () => {
    await openLanguageSheet();

    await fireEvent.press(screen.getByRole("button", { name: "日本語" }));

    expect(i18n.language).toBe("ja");
    expect(readLanguagePreference()).toBe("ja");
    expect(
      await screen.findByRole("heading", { name: "設定" }),
    ).toBeOnTheScreen();
    expect(screen.queryByRole("heading", { name: "言語" })).toBeNull();
    expect(screen.getByText("一般")).toBeOnTheScreen();
    expect(
      await screen.findByRole("button", { name: /言語.*日本語/ }),
    ).toBeOnTheScreen();
  });

  test("in Japanese, choosing 端末の言語 follows the device again", async () => {
    await applyLanguagePreference("ja");
    await openSettings();
    await fireEvent.press(await screen.findByRole("button", { name: /言語/ }));
    expect(
      await screen.findByRole("button", { name: "日本語", selected: true }),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(
        "端末の言語が日本語なら日本語で、それ以外なら英語で表示します。",
      ),
    ).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole("button", { name: "端末の言語" }));

    // Jest's device is en-US.
    expect(i18n.language).toBe("en");
    expect(readLanguagePreference()).toBe("system");
    expect(
      await screen.findByRole("button", { name: /Language.*Device language/ }),
    ).toBeOnTheScreen();
  });
});
