import { renderRouter } from "expo-router/testing-library";

import { screen, userEvent } from "@testing-library/react-native";

jest.useFakeTimers();

describe("S-002 T-002 RT-003 ST-002 ラリーの保存", () => {
  test("名称とタイプを保存すると、ホームに名称とタイプが出る", async () => {
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
    expect(screen.getByText("人")).toBeOnTheScreen();
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
