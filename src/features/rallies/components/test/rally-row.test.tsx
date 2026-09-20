import { render, screen, userEvent } from "@testing-library/react-native";

import { RallyRow } from "../rally-row";

jest.useFakeTimers();

const NOW = new Date("2026-09-20T12:00:00.000Z");

const defaultProps = {
  name: "京都旅行",
  type: "place" as const,
  typeLabel: "場所",
  stampDates: [] as string[],
  onPressStamp: () => {},
  onDelete: () => {},
};

describe("S-020 T-003 ST-001 RallyRow heatmap", () => {
  beforeEach(() => {
    jest.setSystemTime(NOW);
  });

  test("名称・タイプとスタンプ・削除ボタンが出る", async () => {
    await render(<RallyRow {...defaultProps} />);

    expect(screen.getByText("京都旅行")).toBeOnTheScreen();
    expect(screen.getByText("場所")).toBeOnTheScreen();
    expect(screen.getByText("スタンプ 0個")).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "京都旅行にスタンプを押す" }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "京都旅行を削除" }),
    ).toBeOnTheScreen();
  });

  test("初期状態は今日までの英語曜日と7個の丸が出る", async () => {
    await render(<RallyRow {...defaultProps} />);

    for (const weekday of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
      expect(screen.getByText(weekday)).toBeOnTheScreen();
    }
    expect(screen.getAllByTestId("activity-day")).toHaveLength(7);
    expect(
      screen.getByRole("button", { name: "Show last 4 weeks" }).props
        .accessibilityState,
    ).toEqual({ expanded: false });
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
      screen.getByLabelText("Sep 20, 2026, not recorded").props
        .accessibilityState,
    ).toEqual({ selected: false });
    expect(screen.getAllByTestId("activity-day")).toHaveLength(7);
  });

  test("開くと過去21日が上に加わり、閉じると最新7日に戻る", async () => {
    const user = userEvent.setup();
    await render(<RallyRow {...defaultProps} />);

    await user.press(screen.getByRole("button", { name: "Show last 4 weeks" }));

    const expandedDays = screen.getAllByTestId("activity-day");
    expect(expandedDays).toHaveLength(28);
    expect(expandedDays[0]).toHaveAccessibilityValue({
      text: "Aug 24, 2026",
    });
    expect(expandedDays[27]).toHaveAccessibilityValue({
      text: "Sep 20, 2026",
    });
    expect(
      screen.getByRole("button", { name: "Show last 7 days" }).props
        .accessibilityState,
    ).toEqual({ expanded: true });

    await user.press(screen.getByRole("button", { name: "Show last 7 days" }));

    expect(screen.getAllByTestId("activity-day")).toHaveLength(7);
    expect(
      screen.getByRole("button", { name: "Show last 4 weeks" }),
    ).toBeOnTheScreen();
  });

  test("7日と28日の境界外は表示せず、境界内の記録を表示する", async () => {
    const user = userEvent.setup();
    await render(
      <RallyRow
        {...defaultProps}
        stampDates={[
          "2026-08-23T12:00:00.000Z",
          "2026-08-24T12:00:00.000Z",
          "2026-09-13T12:00:00.000Z",
          "2026-09-14T12:00:00.000Z",
          "2026-09-20T12:00:00.000Z",
        ]}
      />,
    );

    expect(screen.getByLabelText("Sep 14, 2026, recorded")).toBeOnTheScreen();
    expect(screen.queryByLabelText("Sep 13, 2026, recorded")).toBeNull();

    await user.press(screen.getByRole("button", { name: "Show last 4 weeks" }));

    expect(screen.getByLabelText("Aug 24, 2026, recorded")).toBeOnTheScreen();
    expect(screen.getByLabelText("Sep 13, 2026, recorded")).toBeOnTheScreen();
    expect(screen.queryByLabelText("Aug 23, 2026, recorded")).toBeNull();
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
      screen.getByRole("button", { name: "京都旅行にスタンプを押す" }),
    );
    await user.press(screen.getByRole("button", { name: "京都旅行を削除" }));

    expect(onPressStamp).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
