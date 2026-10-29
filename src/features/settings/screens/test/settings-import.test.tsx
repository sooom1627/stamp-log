import { Alert, type AlertButton } from "react-native";

import { getDocumentAsync } from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";

import {
  readBackup,
  replaceWithBackup,
} from "@/features/settings/db/backup-db";
import { type Backup } from "@/features/settings/schemas/backup";
import { saveRally } from "@/shared/db/rallies-db";

const emptyBackup: Backup = {
  app: "stamp-log",
  version: 1,
  exportedAt: "2026-10-24T06:00:00.000Z",
  rallies: [],
  stamps: [],
};

const fileBackup: Backup = {
  ...emptyBackup,
  rallies: [
    {
      id: 12,
      name: "Edinburgh",
      emoji: "☕️",
      isFavorite: true,
      isArchived: false,
    },
  ],
  stamps: [
    {
      id: 68,
      rallyId: 12,
      stampedAt: "2026-10-25T03:29:06.662Z",
      memo: "12:15",
    },
  ],
};

let nextFileId = 1;
// The user picks a file with this content in the system picker.
function pickFile(content: string) {
  const file = new File(Paths.cache, `picked-${nextFileId++}.json`);
  file.writeSync(content);
  jest.mocked(getDocumentAsync).mockResolvedValueOnce({
    canceled: false,
    assets: [
      { name: "stamp-log-2026-10-24.json", uri: file.uri, lastModified: 0 },
    ],
  });
}

function findAlertButton(style: AlertButton["style"]): AlertButton {
  const buttons = jest.mocked(Alert.alert).mock.calls.at(-1)?.[2] ?? [];
  const button = buttons.find((candidate) => candidate.style === style);
  if (!button) throw new Error(`Alert button with style ${style} not found`);
  return button;
}

async function openSettingsAndImport() {
  await renderRouter("./src/app");
  await act(() => {
    router.push("/settings");
  });
  await fireEvent.press(
    await screen.findByRole("button", { name: /Import data/ }),
  );
}

beforeEach(async () => {
  // Each test starts from an empty device.
  await replaceWithBackup(emptyBackup);
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
  jest.mocked(getDocumentAsync).mockClear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("S-041 T-002 ST-003 import data from the settings sheet", () => {
  test("imports into an empty device without asking and closes the sheet", async () => {
    pickFile(JSON.stringify(fileBackup));

    await openSettingsAndImport();

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Settings" }),
      ).not.toBeOnTheScreen();
    });
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(getDocumentAsync).toHaveBeenLastCalledWith({
      type: "application/json",
    });
    const { rallies, stamps } = await readBackup();
    expect(rallies).toEqual(fileBackup.rallies);
    expect(stamps).toEqual(fileBackup.stamps);
  });

  test("asks with the counts before replacing this device's data", async () => {
    await saveRally({ name: "Old rally" });
    await saveRally({ name: "Another rally" });
    pickFile(JSON.stringify(fileBackup));

    await openSettingsAndImport();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Replace all data?",
        "This replaces this device's 2 rallies and 0 stamps with the file's 1 rally and 1 stamp. Photos on this device are removed.",
        expect.any(Array),
      );
    });
    await act(() => findAlertButton("destructive").onPress?.());

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Settings" }),
      ).not.toBeOnTheScreen();
    });
    const { rallies } = await readBackup();
    expect(rallies).toEqual(fileBackup.rallies);
  });

  test("changes nothing when the replace is cancelled", async () => {
    await saveRally({ name: "Old rally" });
    const before = await readBackup();
    pickFile(JSON.stringify(fileBackup));

    await openSettingsAndImport();
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });
    await act(() => findAlertButton("cancel").onPress?.());

    expect((await readBackup()).rallies).toEqual(before.rallies);
    expect(screen.getByRole("heading", { name: "Settings" })).toBeOnTheScreen();
  });

  test("changes nothing when no file is picked", async () => {
    await saveRally({ name: "Old rally" });
    const before = await readBackup();

    await openSettingsAndImport();

    await waitFor(() => {
      expect(getDocumentAsync).toHaveBeenCalled();
    });
    expect(Alert.alert).not.toHaveBeenCalled();
    expect((await readBackup()).rallies).toEqual(before.rallies);
    expect(screen.getByRole("heading", { name: "Settings" })).toBeOnTheScreen();
  });

  test.each([
    ["a broken file", "{ not json"],
    ["another app's file", JSON.stringify({ ...fileBackup, app: "other" })],
    ["an unknown version", JSON.stringify({ ...fileBackup, version: 2 })],
  ])("shows an error and changes nothing for %s", async (_name, content) => {
    await saveRally({ name: "Old rally" });
    const before = await readBackup();
    pickFile(content);

    await openSettingsAndImport();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Can't read this file",
        "Choose a file exported from Ato.",
      );
    });
    expect((await readBackup()).rallies).toEqual(before.rallies);
    expect(screen.getByRole("heading", { name: "Settings" })).toBeOnTheScreen();
  });
});
