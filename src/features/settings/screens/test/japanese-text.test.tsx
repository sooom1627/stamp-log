import { Alert } from "react-native";

import { getDocumentAsync } from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";

import { replaceWithBackup } from "@/features/settings/db/backup-db";
import { type Backup } from "@/features/settings/schemas/backup";
import { saveRally } from "@/shared/db/rallies-db";
import { i18n } from "@/shared/i18n";

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

const emptyBackup: Backup = {
  app: "stamp-log",
  version: 1,
  exportedAt: "2026-10-24T06:00:00.000Z",
  rallies: [],
  stamps: [],
};

beforeEach(async () => {
  await replaceWithBackup(emptyBackup);
  await i18n.changeLanguage("ja");
});

afterEach(() => {
  jest.restoreAllMocks();
});

async function openSettings() {
  await renderRouter("./src/app");
  await act(() => {
    router.push("/settings");
  });
}

describe("S-045 T-002 ST-004 settings in Japanese", () => {
  test("the settings sheet is in Japanese, with the app name in English", async () => {
    await openSettings();

    expect(
      await screen.findByRole("heading", { name: "設定" }),
    ).toBeOnTheScreen();
    expect(screen.getByText("データ")).toBeOnTheScreen();
    expect(screen.getByText("データを書き出す")).toBeOnTheScreen();
    expect(screen.getByText("データを読み込む")).toBeOnTheScreen();
    expect(
      screen.getByText("写真は書き出しに含まれません。"),
    ).toBeOnTheScreen();
    expect(screen.getByText("情報")).toBeOnTheScreen();
    expect(screen.getByText("Ato について")).toBeOnTheScreen();
    expect(screen.getByText("ヘルプとサポート")).toBeOnTheScreen();
    expect(screen.getByText("プライバシーポリシー")).toBeOnTheScreen();
    expect(screen.getByText("ライセンス")).toBeOnTheScreen();
    expect(screen.getByText(`Ato ${appJson.expo.version}`)).toBeOnTheScreen();
  });

  test("replacing data asks in Japanese with the counts in English", async () => {
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    await saveRally({ name: "Old rally" });
    const file = new File(Paths.cache, "picked-ja.json");
    file.writeSync(
      JSON.stringify({
        ...emptyBackup,
        rallies: [
          {
            id: 1,
            name: "A",
            emoji: "☕",
            isFavorite: false,
            isArchived: false,
          },
          {
            id: 2,
            name: "B",
            emoji: "☕",
            isFavorite: false,
            isArchived: false,
          },
        ],
      }),
    );
    jest.mocked(getDocumentAsync).mockResolvedValueOnce({
      canceled: false,
      assets: [{ name: "picked-ja.json", uri: file.uri, lastModified: 0 }],
    });

    await openSettings();
    await fireEvent.press(
      await screen.findByRole("button", { name: /データを読み込む/ }),
    );

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith(
        "データを置き換えますか？",
        "この iPhone のデータ（1 rally、0 stamps）を、ファイルのデータ（2 rallies、0 stamps）に置き換えます。この iPhone の写真は削除されます。",
        [
          expect.objectContaining({ text: "キャンセル" }),
          expect.objectContaining({ text: "置き換える" }),
        ],
      );
    });
  });
});
