import { Alert } from "react-native";

import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, fireEvent, screen, within } from "@testing-library/react-native";

import * as ralliesDb from "@/shared/db/rallies-db";
import { saveStamp } from "@/shared/db/stamps-db";
import { i18n } from "@/shared/i18n";

jest.mock("@softwhere-uz/react-native-emoji-keyboard");

jest.useFakeTimers();

beforeEach(async () => {
  await i18n.changeLanguage("ja");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("S-045 T-002 ST-002 rally screens in Japanese", () => {
  test("the create rally sheet is in Japanese", async () => {
    await renderRouter("./src/app", { initialUrl: "/create-rally" });

    expect(await screen.findByText("ラリーを作る")).toBeOnTheScreen();
    expect(screen.getByText("絵文字")).toBeOnTheScreen();
    expect(screen.getByText("名前")).toBeOnTheScreen();
    expect(screen.getByPlaceholderText("例: 行ったカフェ")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "保存" })).toBeOnTheScreen();
  });

  test("an empty rally list says so in Japanese", async () => {
    await renderRouter("./src/app", { initialUrl: "/rallies-list" });

    expect(await screen.findByText("ラリーがありません")).toBeOnTheScreen();
  });

  test("rally detail is in Japanese", async () => {
    await ralliesDb.saveRally({ name: "行ったカフェ", emoji: "☕" });
    const [rally] = await ralliesDb.listRallies();

    await renderRouter("./src/app");
    await act(() => {
      router.push(`/rallies/${rally.id}`);
    });
    const detail = await screen.findByLabelText("ラリーの詳細");

    expect(
      await within(detail).findByText("まだスタンプがありません"),
    ).toBeOnTheScreen();
    expect(within(detail).getByText("最初のスタンプ")).toBeOnTheScreen();
    expect(within(detail).getByText("週平均")).toBeOnTheScreen();
    expect(within(detail).getByText("最後のスタンプ")).toBeOnTheScreen();
  });

  test("deleting a rally with stamps says the stamps go too, in Japanese", async () => {
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    await ralliesDb.saveRally({ name: "行ったカフェ", emoji: "☕" });
    const [rally] = await ralliesDb.listRallies();
    await saveStamp({ rallyId: rally.id });

    await renderRouter("./src/app");
    await act(() => {
      router.push(`/rallies/${rally.id}`);
    });
    const detail = await screen.findByLabelText("ラリーの詳細");
    await within(detail).findByText("1 stamp");

    await fireEvent.press(screen.getByTestId("rally-action-delete"));

    expect(alert).toHaveBeenCalledWith(
      "ラリーを削除しますか？",
      "このラリーのスタンプ（1 stamp）も削除されます。この操作は取り消せません。",
      [
        expect.objectContaining({ text: "キャンセル" }),
        expect.objectContaining({ text: "削除" }),
      ],
    );
  });
});
