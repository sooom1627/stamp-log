import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, screen } from "@testing-library/react-native";

jest.useFakeTimers();

describe("S-018 T-001 ST-001 ボトムタブ", () => {
  test("ホーム・記録・カレンダーのタブで切り替えられる", async () => {
    const app = renderRouter("./src/app");
    await app;

    expect(
      await screen.findByRole("link", { name: "ラリーを作る" }),
    ).toBeOnTheScreen();
    expect(app.getPathname()).toBe("/");

    await act(() => {
      router.push("/records");
    });
    expect(app.getPathname()).toBe("/records");
    expect(screen.getByText("まだスタンプがありません")).toBeOnTheScreen();

    await act(() => {
      router.push("/calendar");
    });
    expect(app.getPathname()).toBe("/calendar");
    expect(
      screen.getByRole("heading", { name: "カレンダー" }),
    ).toBeOnTheScreen();

    await act(() => {
      router.push("/");
    });
    expect(app.getPathname()).toBe("/");
    expect(
      screen.getByRole("link", { name: "ラリーを作る" }),
    ).toBeOnTheScreen();
  });
});
