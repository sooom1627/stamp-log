import { Alert } from "react-native";

import { renderRouter } from "expo-router/testing-library";

import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { i18n } from "@/shared/i18n";
import { createTestQueryClient } from "@/shared/query/create-query-client";

import { LoadError } from "../load-error";
import { RenderError } from "../render-error";
import { StampPost } from "../stamp-post";

jest.useFakeTimers();

beforeEach(async () => {
  await i18n.changeLanguage("ja");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("S-045 T-002 ST-001 shared components in Japanese", () => {
  test("the render error is in Japanese", async () => {
    await render(<RenderError retry={async () => {}} />);

    expect(screen.getByText("エラーが起きました")).toBeOnTheScreen();
    expect(
      screen.getByText("この画面を表示できませんでした。"),
    ).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "再試行" })).toBeOnTheScreen();
  });

  test("the load error is in Japanese", async () => {
    await render(<LoadError onRetry={() => {}} />);

    expect(screen.getByText("読み込めませんでした")).toBeOnTheScreen();
    expect(screen.getByText("再試行")).toBeOnTheScreen();
  });

  test("a stamp post and its delete confirmation are in Japanese", async () => {
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const queryClient = createTestQueryClient();
    await renderRouter({
      index: () => (
        <QueryClientProvider client={queryClient}>
          <StampPost
            stamp={{
              id: 1,
              rallyId: 1,
              stampedAt: "2026-09-18T10:02:00.000Z",
              memo: null,
              photos: [],
            }}
            emoji="🔬"
            title="19:02"
          />
        </QueryClientProvider>
      ),
    });

    expect(screen.getByText("メモなし")).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId("stamp-delete-1"));

    expect(alert).toHaveBeenCalledWith(
      "このスタンプを削除しますか？",
      "この操作は取り消せません。",
      [
        expect.objectContaining({ text: "キャンセル" }),
        expect.objectContaining({ text: "削除" }),
      ],
    );
  });
});
