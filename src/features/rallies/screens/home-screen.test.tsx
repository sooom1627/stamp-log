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
