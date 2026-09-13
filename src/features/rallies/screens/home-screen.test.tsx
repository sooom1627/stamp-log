import { Alert, type AlertButton } from "react-native";

import { renderRouter } from "expo-router/testing-library";

import { act, screen, userEvent, waitFor } from "@testing-library/react-native";

jest.useFakeTimers();

beforeEach(() => {
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

function findAlertButton(style: AlertButton["style"]): AlertButton {
  const alertSpy = jest.mocked(Alert.alert);
  const buttons = alertSpy.mock.calls.at(-1)?.[2] ?? [];
  const button = buttons.find((candidate) => candidate.style === style);
  if (!button) throw new Error(`Alert button with style ${style} not found`);
  return button;
}

async function createRallyFromHome(name: string) {
  await renderRouter("./src/app");

  const user = userEvent.setup();
  await user.press(screen.getByRole("link", { name: "ラリーを作る" }));
  await user.type(
    await screen.findByPlaceholderText("記録したい場所を入力"),
    name,
  );
  await user.press(screen.getByRole("button", { name: "保存" }));
  expect(await screen.findByText(name)).toBeOnTheScreen();

  return user;
}

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

describe("ST-003 名称の必須チェック", () => {
  test("名称が空のときは保存できない", async () => {
    await renderRouter("./src/app");

    const user = userEvent.setup();
    await user.press(screen.getByRole("link", { name: "ラリーを作る" }));

    expect(await screen.findByRole("button", { name: "保存" })).toBeDisabled();
  });

  test("空白だけのときも保存できない", async () => {
    await renderRouter("./src/app");

    const user = userEvent.setup();
    await user.press(screen.getByRole("link", { name: "ラリーを作る" }));
    await user.type(
      await screen.findByPlaceholderText("記録したい場所を入力"),
      "   ",
    );

    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
  });
});

describe("T-002 ST-001 削除ボタン", () => {
  test("一覧のラリーに削除ボタンが出る", async () => {
    await createRallyFromHome("東京の美術館");

    expect(
      screen.getByRole("button", { name: "東京の美術館を削除" }),
    ).toBeOnTheScreen();
  });
});

describe("T-002 ST-002 削除の確認", () => {
  test("削除を押すと確認が出て、キャンセルするとラリーは残る", async () => {
    const user = await createRallyFromHome("山手線全駅");

    await user.press(screen.getByRole("button", { name: "山手線全駅を削除" }));

    expect(Alert.alert).toHaveBeenCalledTimes(1);

    findAlertButton("cancel").onPress?.();

    expect(screen.getByText("山手線全駅")).toBeOnTheScreen();
  });
});

describe("T-002 ST-003 削除の確定", () => {
  test("確認で削除すると、ホーム一覧から消える", async () => {
    const user = await createRallyFromHome("週末のランニング");

    await user.press(
      screen.getByRole("button", { name: "週末のランニングを削除" }),
    );
    await act(async () => {
      findAlertButton("destructive").onPress?.();
    });

    await waitFor(() => {
      expect(screen.queryByText("週末のランニング")).not.toBeOnTheScreen();
    });
  });
});
