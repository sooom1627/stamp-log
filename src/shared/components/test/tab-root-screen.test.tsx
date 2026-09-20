import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, screen } from "@testing-library/react-native";

import { formatHeaderDate } from "@/shared/utils/format-header-date";

jest.useFakeTimers();

describe("S-019 T-001 ST-002 タブルートヘッダー", () => {
  test("3タブの本文先頭に今日の日付が出る", async () => {
    const today = formatHeaderDate(new Date());
    const app = renderRouter("./src/app");
    await app;

    expect(await screen.findAllByText(today)).toHaveLength(3);
    expect(screen.getAllByText(today)[0]).toHaveProp(
      "className",
      expect.stringContaining("mb-4"),
    );
    expect(
      screen.getByRole("link", { name: "ラリーを作る" }),
    ).toBeOnTheScreen();

    await act(() => {
      router.push("/records");
    });
    expect(screen.getAllByText(today)).toHaveLength(3);
    expect(screen.getByText("まだスタンプがありません")).toBeOnTheScreen();

    await act(() => {
      router.push("/calendar");
    });
    expect(screen.getAllByText(today)).toHaveLength(3);
    expect(
      screen.getByRole("heading", { name: "カレンダー" }),
    ).toBeOnTheScreen();
  });
});
