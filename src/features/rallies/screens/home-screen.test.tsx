import { renderRouter } from "expo-router/testing-library";

import { screen, userEvent } from "@testing-library/react-native";

jest.useFakeTimers();

describe("ST-001 ラリー作成入口", () => {
  test("ホームの「ラリーを作る」を押すと作成画面が開く", async () => {
    await renderRouter("./src/app");

    const user = userEvent.setup();
    await user.press(screen.getByRole("link", { name: "ラリーを作る" }));

    expect(
      await screen.findByRole("heading", { name: "ラリーを作る" }),
    ).toBeOnTheScreen();
  });
});

describe("ST-002 ラリーの保存", () => {
  test("名称とタイプを保存すると、ホームに名称とタイプが出る", async () => {
    await renderRouter("./src/app");

    const user = userEvent.setup();
    await user.press(screen.getByRole("link", { name: "ラリーを作る" }));

    const typeRadios = await screen.findAllByRole("radio");
    expect(typeRadios).toHaveLength(3);
    expect(typeRadios[0]).toHaveAccessibleName("場所");
    expect(typeRadios[1]).toHaveAccessibleName("行動");
    expect(typeRadios[2]).toHaveAccessibleName("人");

    await user.type(
      screen.getByPlaceholderText("記録したい場所を入力"),
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
