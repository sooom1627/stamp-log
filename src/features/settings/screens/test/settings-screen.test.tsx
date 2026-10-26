import { File } from "expo-file-system";
import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";
import { shareAsync } from "expo-sharing";

import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";
import { toast } from "sonner-native";

import { backupSchema } from "@/features/data-transfer/schemas/backup";
import * as ralliesDb from "@/features/rallies/db/rallies-db";
import { saveRally } from "@/features/rallies/db/rallies-db";

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

async function openSettings() {
  await renderRouter("./src/app");
  await act(() => {
    router.push("/settings");
  });
}

describe("S-044 T-001 ST-002 settings sheet", () => {
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
    expect(screen.getByRole("button", { name: /About Ato/ })).toBeOnTheScreen();
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

  test("stays on the sheet when a row without an action yet is pressed", async () => {
    await openSettings();

    await fireEvent.press(
      await screen.findByRole("link", { name: /Privacy Policy/ }),
    );
    await fireEvent.press(screen.getByRole("button", { name: /Licenses/ }));

    expect(screen.getByRole("heading", { name: "Settings" })).toBeOnTheScreen();
  });
});

describe("S-041 T-001 ST-005 export data from the settings sheet", () => {
  beforeEach(() => {
    jest.mocked(shareAsync).mockClear();
    jest.mocked(toast.error).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  async function openSettingsWithRally() {
    await saveRally({ name: "Kyoto trip", emoji: "⛩️" });
    await openSettings();
  }

  test("opens the share sheet with the exported file", async () => {
    await openSettingsWithRally();

    await fireEvent.press(
      await screen.findByRole("button", { name: /Export data/ }),
    );

    await waitFor(() => {
      expect(shareAsync).toHaveBeenCalledTimes(1);
    });
    const [uri] = jest.mocked(shareAsync).mock.calls[0];
    const backup = backupSchema.parse(JSON.parse(new File(uri).textSync()));
    expect(backup.rallies).toContainEqual(
      expect.objectContaining({ name: "Kyoto trip" }),
    );
    expect(screen.getByRole("heading", { name: "Settings" })).toBeOnTheScreen();
  });

  test("shows an error when the data cannot be exported", async () => {
    jest
      .spyOn(ralliesDb, "listRallies")
      .mockRejectedValue(new Error("disk error"));
    await openSettings();

    await fireEvent.press(
      await screen.findByRole("button", { name: /Export data/ }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
      );
    });
    expect(shareAsync).not.toHaveBeenCalled();
  });

  test("cannot be pressed again while the file is being shared", async () => {
    jest.mocked(shareAsync).mockReturnValueOnce(new Promise(() => {}));
    await openSettingsWithRally();
    const exportButton = await screen.findByRole("button", {
      name: /Export data/,
    });

    await fireEvent.press(exportButton);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Export data/ })).toBeBusy();
    });
    await fireEvent.press(screen.getByRole("button", { name: /Export data/ }));

    expect(shareAsync).toHaveBeenCalledTimes(1);
  });
});
