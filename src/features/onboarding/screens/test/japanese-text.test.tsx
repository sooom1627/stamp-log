import { renderRouter } from "expo-router/testing-library";
import Storage from "expo-sqlite/kv-store";

import { screen, userEvent } from "@testing-library/react-native";

import * as ralliesDb from "@/shared/db/rallies-db";
import { i18n } from "@/shared/i18n";

jest.useFakeTimers();

beforeEach(async () => {
  // A fresh install on a Japanese device.
  Storage.clearSync();
  for (const rally of await ralliesDb.listRallies()) {
    await ralliesDb.deleteRally(rally.id);
  }
  await i18n.changeLanguage("ja");
});

describe("S-045 T-002 ST-005 onboarding in Japanese", () => {
  test("the intro pages are in Japanese", async () => {
    await renderRouter("./src/app");
    const user = userEvent.setup();

    expect(
      await screen.findByRole("heading", {
        name: "振り返ると、 ちゃんと残っている。",
      }),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(
        "アカウント登録は不要。データはこの iPhone の中だけに保存されます。",
      ),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText("1 / 4 ページ")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "スキップ" })).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "次へ" }));

    expect(
      screen.getByRole("heading", { name: "人も、場所も、 できごとも記録" }),
    ).toBeOnTheScreen();
  });

  test("the first rally is created with its Japanese name", async () => {
    await renderRouter("./src/app");
    const user = userEvent.setup();
    await user.press(await screen.findByRole("button", { name: "スキップ" }));

    expect(screen.getByText("最初に何を記録しますか？")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "朝ランで始める" }));

    expect(await ralliesDb.listRallies()).toEqual([
      expect.objectContaining({ name: "朝ラン", emoji: "🏃" }),
    ]);
  });
});
