import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, fireEvent, screen } from "@testing-library/react-native";

import appJson from "../../../../../app.json";

// Jest has no native app config, so give Constants the one the build embeds.
jest.mock("expo-constants", () => {
  const { default: constants } = jest.requireActual("expo-constants");
  const { expo } = jest.requireActual("../../../../../app.json");
  return {
    __esModule: true,
    default: { ...constants, expoConfig: { ...constants.expoConfig, ...expo } },
  };
});

describe("S-044 T-001 ST-002 settings sheet", () => {
  async function openSettings() {
    await renderRouter("./src/app");
    await act(() => {
      router.push("/settings");
    });
  }

  test("shows the Settings heading with the Data and About rows", async () => {
    await openSettings();

    expect(
      await screen.findByRole("heading", { name: "Settings" }),
    ).toBeOnTheScreen();
    expect(screen.getByText("Data")).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: /Export data/ }),
    ).toBeOnTheScreen();
    expect(
      screen.getByText("Save rallies and stamps to a file"),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: /Import data/ }),
    ).toBeOnTheScreen();
    expect(
      screen.getByText("Replace this device's data with a file"),
    ).toBeOnTheScreen();
    expect(
      screen.getByText("Photos aren't included in the file yet."),
    ).toBeOnTheScreen();
    expect(screen.getByText("About")).toBeOnTheScreen();
    expect(
      screen.getByRole("link", { name: /Help & support/ }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("link", { name: /Privacy Policy/ }),
    ).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: /Licenses/ })).toBeOnTheScreen();
  });

  test("shows the app name and the version from app.json", async () => {
    await openSettings();

    expect(
      await screen.findByText(`Stamplog ${appJson.expo.version}`),
    ).toBeOnTheScreen();
  });

  test("stays on the sheet when a row is pressed, since rows have no action yet", async () => {
    await openSettings();

    await fireEvent.press(
      await screen.findByRole("button", { name: /Export data/ }),
    );
    await fireEvent.press(screen.getByRole("link", { name: /Privacy Policy/ }));

    expect(screen.getByRole("heading", { name: "Settings" })).toBeOnTheScreen();
  });
});
