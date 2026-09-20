import { render, screen, userEvent } from "@testing-library/react-native";

import { RallyRow } from "../rally-row";

jest.useFakeTimers();

describe("S-002 T-002 RT-003 ST-001 RallyRow", () => {
  test("名称・タイプとスタンプ・削除ボタンが出る", async () => {
    await render(
      <RallyRow
        name="京都旅行"
        typeLabel="人"
        stampLabels={[]}
        onPressStamp={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(screen.getByText("京都旅行")).toBeOnTheScreen();
    expect(screen.getByText("人")).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "京都旅行にスタンプを押す" }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "京都旅行を削除" }),
    ).toBeOnTheScreen();
  });

  test("スタンプの日時とメモが出る。メモが無い日時は日時だけ", async () => {
    await render(
      <RallyRow
        name="京都旅行"
        typeLabel="人"
        stampLabels={[
          { id: 1, label: "2026/09/19 21:34", memo: "会った" },
          { id: 2, label: "2026/09/20 10:00", memo: null },
        ]}
        onPressStamp={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(screen.getByText("2026/09/19 21:34")).toBeOnTheScreen();
    expect(screen.getByText("会った")).toBeOnTheScreen();
    expect(screen.getByText("2026/09/20 10:00")).toBeOnTheScreen();
    expect(screen.getByText("スタンプ 2個")).toBeOnTheScreen();
  });

  test("スタンプと削除を押すとそれぞれの callback が呼ばれる", async () => {
    const onPressStamp = jest.fn();
    const onDelete = jest.fn();
    const user = userEvent.setup();

    await render(
      <RallyRow
        name="京都旅行"
        typeLabel="人"
        stampLabels={[]}
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
