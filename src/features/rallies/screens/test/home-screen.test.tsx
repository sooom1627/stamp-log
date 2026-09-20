import { Alert, type AlertButton } from "react-native";

import { renderRouter } from "expo-router/testing-library";

import { act, screen, userEvent, waitFor } from "@testing-library/react-native";
import { toast } from "sonner-native";

import * as ralliesDb from "../../db/rallies-db";
import * as stampsDb from "../../db/stamps-db";
import { type RallyType } from "../../schemas/rallies";

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

async function renderHomeWithRally(name: string, type: RallyType = "place") {
  await ralliesDb.saveRally({ name, type });
  await renderRouter("./src/app");
  expect(await screen.findByText(name)).toBeOnTheScreen();
  return userEvent.setup();
}

describe("ST-001 ラリー作成入口", () => {
  test("ホームの「ラリーを作る」を押すと作成画面が開く", async () => {
    await renderRouter("./src/app");

    const user = userEvent.setup();
    await user.press(screen.getByRole("link", { name: "ラリーを作る" }));

    expect(
      await screen.findByPlaceholderText("記録したい場所を入力"),
    ).toBeOnTheScreen();
    expect(
      screen.queryByRole("heading", { name: "ラリーを作る" }),
    ).not.toBeOnTheScreen();
  });
});

describe("S-022 セクション見出し", () => {
  test("ラリーがあるとき Your Days が出る", async () => {
    await renderHomeWithRally("Your Days確認用");

    expect(
      screen.getByRole("heading", { name: "Your Days" }),
    ).toBeOnTheScreen();
  });
});

describe("T-002 ST-001 削除ボタン", () => {
  test("一覧のラリーに削除ボタンが出る", async () => {
    await renderHomeWithRally("東京の美術館");

    expect(
      screen.getByRole("button", { name: "東京の美術館を削除" }),
    ).toBeOnTheScreen();
  });
});

describe("T-002 ST-002 削除の確認", () => {
  test("削除を押すと確認が出て、キャンセルするとラリーは残る", async () => {
    const user = await renderHomeWithRally("山手線全駅");

    await user.press(screen.getByRole("button", { name: "山手線全駅を削除" }));

    expect(Alert.alert).toHaveBeenCalledTimes(1);

    findAlertButton("cancel").onPress?.();

    expect(screen.getByText("山手線全駅")).toBeOnTheScreen();
  });
});

describe("T-002 ST-003 削除の確定", () => {
  test("確認で削除すると、ホーム一覧から消える", async () => {
    const user = await renderHomeWithRally("週末のランニング");

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

  beforeEach(() => {
    jest.setSystemTime(new Date(stampedAt));
  });

  test("スタンプを押すとそのラリーの今日の丸が記録済みになる", async () => {
    const user = await renderHomeWithRally("今年会った研究者");

    await user.press(
      screen.getByRole("button", {
        name: "今年会った研究者に今日のスタンプを押す",
      }),
    );

    expect(
      await screen.findByRole("button", {
        name: "今年会った研究者は今日記録済み",
      }),
    ).toBeDisabled();
  });

  test("人・場所・行動どれも同じ操作で押せ、今日の丸が記録済みになる", async () => {
    const rallies = [
      { name: "同期の仲間", type: "person" },
      { name: "山手線の駅", type: "place" },
      { name: "今年やりたいこと", type: "action" },
    ] as const;

    for (const rally of rallies) {
      await ralliesDb.saveRally(rally);
    }

    await renderRouter("./src/app");
    const user = userEvent.setup();
    expect(await screen.findByText("同期の仲間")).toBeOnTheScreen();

    for (const rally of rallies) {
      await user.press(
        screen.getByRole("button", {
          name: `${rally.name}に今日のスタンプを押す`,
        }),
      );
    }

    expect(
      (
        await screen.findAllByRole("button", {
          name: /は今日記録済み/,
        })
      ).length,
    ).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText("誰")).not.toBeOnTheScreen();
    expect(screen.queryByText("どこ")).not.toBeOnTheScreen();
    expect(screen.queryByText("何")).not.toBeOnTheScreen();
  });

  test("保存に失敗するとエラーのトーストが出る", async () => {
    jest.spyOn(stampsDb, "saveStamp").mockRejectedValue(new Error("disk full"));
    jest.mocked(toast.error).mockClear();

    const user = await renderHomeWithRally("失敗するラリー");
    await user.press(
      screen.getByRole("button", {
        name: "失敗するラリーに今日のスタンプを押す",
      }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "うまくいきませんでした。もう一度お試しください。",
      );
    });
    expect(
      screen.queryByText("保存できませんでした。もう一度お試しください。"),
    ).not.toBeOnTheScreen();
    expect(Alert.alert).not.toHaveBeenCalledWith(
      "保存できませんでした。もう一度お試しください。",
      "disk full",
    );
  });
});

describe("S-002 T-002 ST-001 メモ追加のトースト", () => {
  const stampedAt = "2026-09-20T15:00:00.000Z";

  beforeEach(() => {
    jest.setSystemTime(new Date(stampedAt));
    jest.mocked(toast).mockClear();
  });

  test("押すとトーストが出て、約5秒で消えてもスタンプは残る", async () => {
    const user = await renderHomeWithRally("メモ確認用のラリー");

    await user.press(
      screen.getByRole("button", {
        name: "メモ確認用のラリーに今日のスタンプを押す",
      }),
    );

    expect(
      await screen.findByRole("button", {
        name: "メモ確認用のラリーは今日記録済み",
      }),
    ).toBeDisabled();
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

    expect(
      screen.getByRole("button", {
        name: "メモ確認用のラリーは今日記録済み",
      }),
    ).toBeDisabled();
  });
});

describe("S-002 T-002 ST-005 メモ追加の formSheet", () => {
  const stampedAt = "2026-09-21T10:00:00.000Z";

  beforeEach(() => {
    jest.setSystemTime(new Date(stampedAt));
    jest.mocked(toast).mockClear();
  });

  test("トーストの「メモを追加」で formSheet が開き、保存後も記録済みの丸が残る", async () => {
    const user = await renderHomeWithRally("メモ追加用のラリー");

    await user.press(
      screen.getByRole("button", {
        name: "メモ追加用のラリーに今日のスタンプを押す",
      }),
    );

    expect(
      await screen.findByRole("button", {
        name: "メモ追加用のラリーは今日記録済み",
      }),
    ).toBeDisabled();

    const action = findToastAction();
    expect(action.label).toBe("メモを追加");

    await act(async () => {
      action.onClick();
    });

    expect(toast.dismiss).toHaveBeenCalled();
    expect(await screen.findByText("メモ")).toBeOnTheScreen();
    expect(
      screen.queryByRole("heading", { name: "メモを追加" }),
    ).not.toBeOnTheScreen();

    await user.type(screen.getByPlaceholderText("メモを入力"), "会った");
    await user.press(screen.getByRole("button", { name: "保存" }));

    expect(
      await screen.findByRole("button", {
        name: "メモ追加用のラリーは今日記録済み",
      }),
    ).toBeDisabled();
  });
});

describe("S-002 T-002 RT-002 失敗表示", () => {
  test("ラリー一覧の読込に失敗すると読込エラーと再試行が出る", async () => {
    jest
      .spyOn(ralliesDb, "listRallies")
      .mockRejectedValue(new Error("disk full"));

    await renderRouter("./src/app");

    expect(await screen.findByText("読み込めませんでした")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "再試行" })).toBeOnTheScreen();
    expect(
      screen.queryByText("保存できませんでした。もう一度お試しください。"),
    ).not.toBeOnTheScreen();
  });

  test("スタンプ一覧の読込に失敗すると読込エラーと再試行が出る", async () => {
    jest
      .spyOn(stampsDb, "listStamps")
      .mockRejectedValue(new Error("disk full"));

    await renderRouter("./src/app");

    expect(await screen.findByText("読み込めませんでした")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "再試行" })).toBeOnTheScreen();
  });

  test("読込失敗のあと再試行すると一覧が出る", async () => {
    const listSpy = jest
      .spyOn(ralliesDb, "listRallies")
      .mockRejectedValue(new Error("disk full"));

    await renderRouter("./src/app");
    expect(await screen.findByText("読み込めませんでした")).toBeOnTheScreen();

    listSpy.mockResolvedValue([]);
    const user = userEvent.setup();
    await user.press(screen.getByRole("button", { name: "再試行" }));

    await waitFor(() => {
      expect(screen.queryByText("読み込めませんでした")).not.toBeOnTheScreen();
    });
  });

  test("削除に失敗するとエラーのトーストが出る", async () => {
    jest
      .spyOn(ralliesDb, "deleteRally")
      .mockRejectedValue(new Error("disk full"));
    jest.mocked(toast.error).mockClear();

    const user = await renderHomeWithRally("削除失敗するラリー");
    await user.press(
      screen.getByRole("button", { name: "削除失敗するラリーを削除" }),
    );
    await act(async () => {
      findAlertButton("destructive").onPress?.();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "うまくいきませんでした。もう一度お試しください。",
      );
    });
    expect(screen.getByText("削除失敗するラリー")).toBeOnTheScreen();
  });
});
