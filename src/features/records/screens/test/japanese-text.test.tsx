import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, screen, within } from "@testing-library/react-native";

import { i18n } from "@/shared/i18n";

jest.useFakeTimers();

beforeEach(async () => {
  jest.setSystemTime(new Date(2026, 8, 20, 15, 0));
  await i18n.changeLanguage("ja");
});

async function openRoute(path: string) {
  await renderRouter("./src/app");
  await act(() => {
    router.push(path);
  });
}

describe("S-045 T-002 ST-006 tabs in Japanese", () => {
  test("names the tabs ホーム and 記録", async () => {
    await renderRouter("./src/app");
    await screen.findByLabelText("記録の一覧");

    const tabs = screen.container
      .queryAll((instance) => instance.type === "RNSTabsScreenIOS")
      .map((instance) => instance.props.title);
    expect(tabs).toEqual(["ホーム", "記録"]);
  });
});

describe("S-045 T-002 ST-003 Logs in Japanese", () => {
  test("the Logs timeline is in Japanese", async () => {
    await openRoute("/records");

    const logs = await screen.findByLabelText("記録の一覧");

    expect(within(logs).getByText("これまでのスタンプ")).toBeOnTheScreen();
    expect(
      await within(logs).findByText("まだスタンプがありません"),
    ).toBeOnTheScreen();
  });

  test("an empty Logs day says so in Japanese", async () => {
    await openRoute("/logs-day?date=2026-09-18");

    expect(await screen.findByText("この日は押していません")).toBeOnTheScreen();
  });
});
