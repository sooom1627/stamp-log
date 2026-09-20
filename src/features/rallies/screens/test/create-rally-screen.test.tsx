import { renderRouter } from "expo-router/testing-library";

import {
  act,
  fireEvent,
  screen,
  userEvent,
} from "@testing-library/react-native";

import * as ralliesDb from "../../db/rallies-db";

jest.useFakeTimers();

afterEach(() => {
  jest.restoreAllMocks();
});

describe("S-002 T-002 RT-003 ST-002 ラリーの保存", () => {
  test("名称とタイプを保存すると、ホームに名称とタイプアイコンが出る", async () => {
    await renderRouter("./src/app");

    const user = userEvent.setup();
    await user.press(screen.getByRole("link", { name: "ラリーを作る" }));

    await user.type(
      await screen.findByPlaceholderText("記録したい場所を入力"),
      "京都旅行",
    );
    await user.press(screen.getByRole("radio", { name: "人" }));

    expect(screen.getByDisplayValue("京都旅行")).toBeOnTheScreen();
    expect(screen.getByPlaceholderText("記録したい人を入力")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "保存" }));

    expect(await screen.findByText("京都旅行")).toBeOnTheScreen();
    expect(screen.queryByText("人")).toBeNull();
    expect(screen.getByLabelText("人")).toBeOnTheScreen();
  });

  test("項目ラベルがあり、Doneからも保存できる", async () => {
    await renderRouter("./src/app");
    const user = userEvent.setup();
    await user.press(screen.getByRole("link", { name: "ラリーを作る" }));

    expect(await screen.findByText("タイプ")).toBeOnTheScreen();
    expect(screen.getByText("名称")).toBeOnTheScreen();

    const nameInput = screen.getByPlaceholderText("記録したい場所を入力");
    await user.type(nameInput, "鎌倉の寺");
    await act(async () => {
      fireEvent(nameInput, "submitEditing");
    });

    expect(await screen.findByText("鎌倉の寺")).toBeOnTheScreen();
  });

  test("保存中は状態が表示され、保存ボタンを再度押せない", async () => {
    jest
      .spyOn(ralliesDb, "saveRally")
      .mockImplementation(() => new Promise<void>(() => {}));
    await renderRouter("./src/app", { initialUrl: "/create-rally" });

    const user = userEvent.setup();
    await user.type(
      await screen.findByPlaceholderText("記録したい場所を入力"),
      "保存中のラリー",
    );
    await user.press(screen.getByRole("button", { name: "保存" }));

    expect(await screen.findByText("保存中…")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "保存中…" })).toBeDisabled();
  });
});

describe("S-002 T-002 RT-003 ST-002 名称の必須チェック", () => {
  test("名称が空のときは保存できない", async () => {
    await renderRouter("./src/app", { initialUrl: "/create-rally" });

    expect(await screen.findByRole("button", { name: "保存" })).toBeDisabled();
  });

  test("空白だけのときも保存できない", async () => {
    await renderRouter("./src/app", { initialUrl: "/create-rally" });
    const user = userEvent.setup();
    await user.type(
      await screen.findByPlaceholderText("記録したい場所を入力"),
      "   ",
    );

    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
  });
});
