import { renderRouter } from "expo-router/testing-library";

import { screen, within } from "@testing-library/react-native";

import * as ralliesDb from "@/shared/db/rallies-db";
import { i18n } from "@/shared/i18n";

jest.useFakeTimers();

beforeEach(async () => {
  jest.setSystemTime(new Date(2026, 8, 20, 20, 10));
  for (const rally of await ralliesDb.listRallies()) {
    await ralliesDb.deleteRally(rally.id);
  }
  await i18n.changeLanguage("ja");
});

describe("S-045 T-002 ST-007 home in Japanese", () => {
  test("home is in Japanese, keeping Your Days and counts in English", async () => {
    await ralliesDb.saveRally({ name: "行ったカフェ", emoji: "☕" });

    await renderRouter("./src/app");

    expect(
      await screen.findByRole("button", {
        name: "行ったカフェに今日のスタンプを押す",
      }),
    ).toBeOnTheScreen();
    expect(screen.getByText("Your Days")).toBeOnTheScreen();
    expect(screen.getByText("すべて見る")).toBeOnTheScreen();
    expect(screen.getByText("新しいラリー")).toBeOnTheScreen();
    expect(
      screen.getByRole("link", { name: "ラリーを作る" }),
    ).toBeOnTheScreen();

    const today = screen.getByTestId("today-card");
    expect(within(today).getByText("今日")).toBeOnTheScreen();
    expect(
      within(today).getByText("今日はまだ押していません"),
    ).toBeOnTheScreen();

    const todayLog = screen.getByTestId("today-log-card");
    expect(within(todayLog).getByText("今日の記録")).toBeOnTheScreen();
    expect(within(todayLog).getByText("いま 20:10")).toBeOnTheScreen();

    const withAto = screen.getByTestId("with-ato-card");
    expect(within(withAto).getByText("Ato との日々")).toBeOnTheScreen();
    expect(within(withAto).getByText("0 stamps")).toBeOnTheScreen();
  });
});
