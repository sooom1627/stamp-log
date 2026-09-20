import { render, screen, userEvent } from "@testing-library/react-native";

import { RallyRow } from "../rally-row";

jest.useFakeTimers();

describe("S-002 T-002 RT-003 ST-001 RallyRow", () => {
  test("名称・タイプとスタンプ・削除ボタンが出る", async () => {
    await render(
      <RallyRow
        name="京都旅行"
        type="person"
        typeLabel="人"
        stampCount={0}
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
        type="person"
        typeLabel="人"
        stampCount={2}
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

  test("総件数を保ちながら直近のスタンプ3件だけが出る", async () => {
    await render(
      <RallyRow
        name="京都旅行"
        type="place"
        typeLabel="場所"
        stampCount={4}
        stampLabels={[
          { id: 4, label: "2026/09/20 10:00", memo: null },
          { id: 3, label: "2026/09/19 10:00", memo: null },
          { id: 2, label: "2026/09/18 10:00", memo: null },
          { id: 1, label: "2026/09/17 10:00", memo: null },
        ]}
        onPressStamp={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(screen.getByText("スタンプ 4個")).toBeOnTheScreen();
    expect(screen.getByText("2026/09/20 10:00")).toBeOnTheScreen();
    expect(screen.getByText("2026/09/18 10:00")).toBeOnTheScreen();
    expect(screen.queryByText("2026/09/17 10:00")).not.toBeOnTheScreen();
  });

  test("スタンプと削除を押すとそれぞれの callback が呼ばれる", async () => {
    const onPressStamp = jest.fn();
    const onDelete = jest.fn();
    const user = userEvent.setup();

    await render(
      <RallyRow
        name="京都旅行"
        type="person"
        typeLabel="人"
        stampCount={0}
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
