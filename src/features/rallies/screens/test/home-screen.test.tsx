import { Alert, type AlertButton } from "react-native";

import { renderRouter } from "expo-router/testing-library";

import { act, screen, userEvent, waitFor } from "@testing-library/react-native";
import { toast } from "sonner-native";

import { formatDateTime } from "@/shared/utils/format-date-time";

import * as stampsDb from "../../db/stamps-db";

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

function findToastAction(): { label: string; onClick: () => void } {
  const options = jest.mocked(toast).mock.calls.at(-1)?.[1];
  const action = options?.action;
  if (
    !action ||
    typeof action !== "object" ||
    !("onClick" in action) ||
    typeof action.onClick !== "function"
  ) {
    throw new Error("toast action not found");
  }
  return action;
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

describe("S-002 T-001 ST-004 スタンプを押す", () => {
  const stampedAt = "2026-09-19T12:34:00.000Z";
  const stampDateTime = formatDateTime(stampedAt);

  beforeEach(() => {
    jest.setSystemTime(new Date(stampedAt));
  });

  test("スタンプを押すとそのラリー直下に日時が出る", async () => {
    const user = await createRallyFromHome("今年会った研究者");

    await user.press(
      screen.getByRole("button", { name: "今年会った研究者にスタンプを押す" }),
    );

    expect(await screen.findByText(stampDateTime)).toBeOnTheScreen();
  });

  test("人・場所・行動どれも同じ操作で押せ、出るのは日時だけ", async () => {
    await renderRouter("./src/app");
    const user = userEvent.setup();

    const rallies = [
      { name: "同期の仲間", type: "人", placeholder: "記録したい人を入力" },
      {
        name: "山手線の駅",
        type: "場所",
        placeholder: "記録したい場所を入力",
      },
      {
        name: "今年やりたいこと",
        type: "行動",
        placeholder: "記録したい行動を入力",
      },
    ] as const;

    for (const rally of rallies) {
      await user.press(screen.getByRole("link", { name: "ラリーを作る" }));
      await user.press(await screen.findByRole("radio", { name: rally.type }));
      await user.type(
        screen.getByPlaceholderText(rally.placeholder),
        rally.name,
      );
      await user.press(screen.getByRole("button", { name: "保存" }));
      expect(await screen.findByText(rally.name)).toBeOnTheScreen();
    }

    for (const rally of rallies) {
      await user.press(
        screen.getByRole("button", { name: `${rally.name}にスタンプを押す` }),
      );
    }

    expect(
      (await screen.findAllByText(stampDateTime)).length,
    ).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText("誰")).not.toBeOnTheScreen();
    expect(screen.queryByText("どこ")).not.toBeOnTheScreen();
    expect(screen.queryByText("何")).not.toBeOnTheScreen();
  });

  test("保存に失敗するとエラーメッセージが出る", async () => {
    jest.spyOn(stampsDb, "saveStamp").mockRejectedValue(new Error("disk full"));

    const user = await createRallyFromHome("失敗するラリー");
    await user.press(
      screen.getByRole("button", { name: "失敗するラリーにスタンプを押す" }),
    );

    expect(
      await screen.findByText("保存できませんでした。もう一度お試しください。"),
    ).toBeOnTheScreen();
    expect(Alert.alert).not.toHaveBeenCalledWith(
      "保存できませんでした。もう一度お試しください。",
      "disk full",
    );
  });
});

describe("S-002 T-002 ST-001 メモ追加のトースト", () => {
  const stampedAt = "2026-09-20T15:00:00.000Z";
  const stampDateTime = formatDateTime(stampedAt);

  beforeEach(() => {
    jest.setSystemTime(new Date(stampedAt));
    jest.mocked(toast).mockClear();
  });

  test("押すとトーストが出て、約5秒で消えてもスタンプは残る", async () => {
    const user = await createRallyFromHome("メモ確認用のラリー");

    await user.press(
      screen.getByRole("button", {
        name: "メモ確認用のラリーにスタンプを押す",
      }),
    );

    expect(await screen.findByText(stampDateTime)).toBeOnTheScreen();
    expect(toast).toHaveBeenCalledWith(
      "メモを追加しますか？",
      expect.objectContaining({
        duration: 5000,
        action: {
          label: "メモを追加",
          onClick: expect.any(Function),
        },
      }),
    );

    await act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.getByText(stampDateTime)).toBeOnTheScreen();
  });
});

describe("S-002 T-002 ST-005 メモ追加の formSheet", () => {
  const stampedAt = "2026-09-21T10:00:00.000Z";
  const stampDateTime = formatDateTime(stampedAt);

  beforeEach(() => {
    jest.setSystemTime(new Date(stampedAt));
    jest.mocked(toast).mockClear();
  });

  test("トーストの「メモを追加」で formSheet が開き、保存するとラリー直下にメモが見える", async () => {
    const user = await createRallyFromHome("メモ追加用のラリー");

    await user.press(
      screen.getByRole("button", {
        name: "メモ追加用のラリーにスタンプを押す",
      }),
    );

    expect(await screen.findByText(stampDateTime)).toBeOnTheScreen();

    const action = findToastAction();
    expect(action.label).toBe("メモを追加");

    await act(async () => {
      action.onClick();
    });

    expect(toast.dismiss).toHaveBeenCalled();
    expect(
      await screen.findByRole("heading", { name: "メモを追加" }),
    ).toBeOnTheScreen();

    await user.type(screen.getByPlaceholderText("メモを入力"), "会った");
    await user.press(screen.getByRole("button", { name: "保存" }));

    expect(await screen.findByText("会った")).toBeOnTheScreen();
    expect(screen.getByText(stampDateTime)).toBeOnTheScreen();
  });
});
