import { render, screen, userEvent } from "@testing-library/react-native";

import { RallyRow } from "../rally-row";

jest.useFakeTimers();

const NOW = new Date("2026-09-20T12:00:00.000Z");

const defaultProps = {
  name: "京都旅行",
  type: "place" as const,
  stampDates: [] as string[],
  onPressStamp: () => {},
  onDelete: () => {},
};

describe("S-020 T-005 ST-001 compact RallyRow", () => {
  beforeEach(() => {
    jest.setSystemTime(NOW);
  });

  test("タイプ、名称、スタンプ数、今日の追加、削除が出る", async () => {
    await render(<RallyRow {...defaultProps} />);

    expect(screen.getByText("京都旅行")).toBeOnTheScreen();
    expect(screen.queryByText("場所")).toBeNull();
    expect(screen.getByLabelText("場所")).toBeOnTheScreen();
    expect(screen.getByText("スタンプ 0個")).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "京都旅行に今日のスタンプを押す" }),
    ).toBeOnTheScreen();
    expect(screen.queryByText("押す")).toBeNull();
    expect(
      screen.getByRole("button", { name: "京都旅行を削除" }),
    ).toBeOnTheScreen();
  });

  test("今日までの曜日と7個の丸だけが横幅いっぱいに出る", async () => {
    await render(<RallyRow {...defaultProps} />);

    expect(screen.queryByText("Last 7 days")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Show last 4 weeks" }),
    ).toBeNull();
    for (const weekday of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
      expect(screen.getByText(weekday)).toBeOnTheScreen();
    }
    expect(screen.getAllByTestId("activity-day")).toHaveLength(7);
    expect(screen.getByTestId("activity-week")).toHaveProp(
      "className",
      "w-full gap-3 pt-1",
    );
  });

  test("todayRing は今日の丸だけをリングで示す", async () => {
    await render(<RallyRow {...defaultProps} />);

    expect(screen.getAllByTestId("activity-today-ring")).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "京都旅行に今日のスタンプを押す" }),
    ).toContainElement(screen.getByTestId("activity-today-ring"));
  });

  test("記録がある日だけ選択され、同じ日の複数件は1つの丸になる", async () => {
    await render(
      <RallyRow
        {...defaultProps}
        stampDates={["2026-09-19T02:00:00.000Z", "2026-09-19T10:00:00.000Z"]}
      />,
    );

    expect(screen.getByText("スタンプ 2個")).toBeOnTheScreen();
    expect(
      screen.getByLabelText("Sep 19, 2026, recorded").props.accessibilityState,
    ).toEqual({ selected: true });
    expect(
      screen.getByRole("button", {
        name: "京都旅行に今日のスタンプを押す",
      }).props.accessibilityState,
    ).toEqual({ disabled: false, selected: false });
    expect(screen.getAllByTestId("activity-day")).toHaveLength(7);
  });

  test("今日が記録済みなら今日セルから追加できない", async () => {
    const onPressStamp = jest.fn();
    const user = userEvent.setup();
    await render(
      <RallyRow
        {...defaultProps}
        stampDates={["2026-09-20T02:00:00.000Z"]}
        onPressStamp={onPressStamp}
      />,
    );

    const todayButton = screen.getByRole("button", {
      name: "京都旅行は今日記録済み",
    });
    expect(todayButton.props.accessibilityState).toEqual({
      disabled: true,
      selected: true,
    });

    await user.press(todayButton);
    expect(onPressStamp).not.toHaveBeenCalled();
  });

  test("直近7日の境界外は表示せず、境界内の記録を表示する", async () => {
    await render(
      <RallyRow
        {...defaultProps}
        stampDates={[
          "2026-09-13T12:00:00.000Z",
          "2026-09-14T12:00:00.000Z",
          "2026-09-20T12:00:00.000Z",
        ]}
      />,
    );

    expect(screen.getByLabelText("Sep 14, 2026, recorded")).toBeOnTheScreen();
    expect(screen.queryByLabelText("Sep 13, 2026, recorded")).toBeNull();
  });

  test("スタンプと削除を押すとそれぞれの callback が呼ばれる", async () => {
    const onPressStamp = jest.fn();
    const onDelete = jest.fn();
    const user = userEvent.setup();

    await render(
      <RallyRow
        {...defaultProps}
        onPressStamp={onPressStamp}
        onDelete={onDelete}
      />,
    );

    await user.press(
      screen.getByRole("button", { name: "京都旅行に今日のスタンプを押す" }),
    );
    await user.press(screen.getByRole("button", { name: "京都旅行を削除" }));

    expect(onPressStamp).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
