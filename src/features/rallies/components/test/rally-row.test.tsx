import { render, screen, userEvent } from "@testing-library/react-native";

import { RallyRow } from "../rally-row";

jest.useFakeTimers();

const NOW = new Date("2026-09-20T12:00:00.000Z");

const defaultProps = {
  name: "Kyoto trip",
  emoji: "⛩️",
  stampDates: [] as string[],
  onPressStamp: () => {},
  onDelete: () => {},
};

describe("S-020 T-005 ST-001 compact RallyRow", () => {
  beforeEach(() => {
    jest.setSystemTime(NOW);
  });

  test("shows emoji, name, stamp count, today stamp, and delete", async () => {
    await render(<RallyRow {...defaultProps} />);

    expect(screen.getByText("⛩️")).toBeOnTheScreen();
    expect(screen.getByText("Kyoto trip")).toBeOnTheScreen();
    expect(screen.queryByText("Place")).toBeNull();
    expect(screen.queryByLabelText("Place")).toBeNull();
    expect(screen.getByText("0 stamps")).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "Stamp Kyoto trip for today" }),
    ).toBeOnTheScreen();
    expect(screen.queryByText("Stamp")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Delete Kyoto trip" }),
    ).toBeOnTheScreen();
  });

  test("shows weekdays and 7 circles full width", async () => {
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

  test("todayRing highlights only today with a ring", async () => {
    await render(<RallyRow {...defaultProps} />);

    expect(screen.getAllByTestId("activity-today-ring")).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "Stamp Kyoto trip for today" }),
    ).toContainElement(screen.getByTestId("activity-today-ring"));
  });

  test("marks recorded days only; multiple stamps on one day become one dot", async () => {
    await render(
      <RallyRow
        {...defaultProps}
        stampDates={["2026-09-19T02:00:00.000Z", "2026-09-19T10:00:00.000Z"]}
      />,
    );

    expect(screen.getByText("2 stamps")).toBeOnTheScreen();
    expect(
      screen.getByLabelText("Sep 19, 2026, recorded").props.accessibilityState,
    ).toEqual({ selected: true });
    expect(
      screen.getByRole("button", {
        name: "Stamp Kyoto trip for today",
      }).props.accessibilityState,
    ).toEqual({ disabled: false, selected: false });
    expect(screen.getAllByTestId("activity-day")).toHaveLength(7);
  });

  test("cannot add from today cell when already recorded today", async () => {
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
      name: "Kyoto trip already stamped today",
    });
    expect(todayButton.props.accessibilityState).toEqual({
      disabled: true,
      selected: true,
    });

    await user.press(todayButton);
    expect(onPressStamp).not.toHaveBeenCalled();
  });

  test("hides records outside the last 7 days and shows in-range records", async () => {
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

  test("stamp and delete buttons call their callbacks", async () => {
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
      screen.getByRole("button", { name: "Stamp Kyoto trip for today" }),
    );
    await user.press(screen.getByRole("button", { name: "Delete Kyoto trip" }));

    expect(onPressStamp).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
