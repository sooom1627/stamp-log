import { render, screen, userEvent } from "@testing-library/react-native";

import { RallyTile } from "../rally-tile";

jest.useFakeTimers();

const NOW = new Date(2026, 8, 20, 12, 0);
const at = (day: number, hours = 12) =>
  new Date(2026, 8, day, hours).toISOString();

const defaultProps = {
  name: "Kyoto trip",
  emoji: "⛩️",
  stampDates: [] as string[],
  onPressStamp: () => {},
  onPressDetail: () => {},
};

describe("S-029 T-002 ST-001 RallyTile", () => {
  beforeEach(() => {
    jest.setSystemTime(NOW);
  });

  test("shows emoji, name, stamp count, today button, and detail link", async () => {
    await render(<RallyTile {...defaultProps} />);

    expect(screen.getByText("⛩️")).toBeOnTheScreen();
    expect(screen.getByText("Kyoto trip")).toHaveProp("numberOfLines", 2);
    expect(screen.getByText("0 stamps")).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "Stamp Kyoto trip for today" }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "View Kyoto trip details" }),
    ).toBeOnTheScreen();
  });

  test("shows one-letter weekdays and 7 dots starting today, today as a dot too", async () => {
    await render(<RallyTile {...defaultProps} />);

    // Today is Sunday Sep 20, 2026; the week goes back to Monday Sep 14.
    expect(
      screen.getAllByTestId("activity-weekday").map((label) => label.children),
    ).toEqual([["S"], ["S"], ["F"], ["T"], ["W"], ["T"], ["M"]]);
    const activityDays = screen.getAllByTestId("activity-day");
    expect(activityDays).toHaveLength(7);
    expect(activityDays[0]).toHaveAccessibleName("Sep 20, 2026, not recorded");
    expect(activityDays[6]).toHaveAccessibleName("Sep 14, 2026, not recorded");
    expect(screen.queryByTestId("activity-today-ring")).toBeNull();
  });

  test("marks recorded days only; multiple stamps on one day become one dot", async () => {
    await render(
      <RallyTile {...defaultProps} stampDates={[at(19, 2), at(19, 10)]} />,
    );

    expect(screen.getByText("2 stamps")).toBeOnTheScreen();
    expect(screen.getByLabelText("Sep 19, 2026, recorded")).toBeSelected();
    expect(
      screen.getByLabelText("Sep 18, 2026, not recorded"),
    ).not.toBeSelected();
  });

  test("uses the singular for one stamp", async () => {
    await render(<RallyTile {...defaultProps} stampDates={[at(19)]} />);

    expect(screen.getByText("1 stamp")).toBeOnTheScreen();
  });

  test("shows a checked, disabled button when already stamped today", async () => {
    const onPressStamp = jest.fn();
    const user = userEvent.setup();
    await render(
      <RallyTile
        {...defaultProps}
        stampDates={[at(20, 8)]}
        onPressStamp={onPressStamp}
      />,
    );

    const todayButton = screen.getByRole("button", {
      name: "Kyoto trip already stamped today",
    });
    expect(todayButton).toBeDisabled();
    expect(screen.getByLabelText("Sep 20, 2026, recorded")).toBeSelected();

    await user.press(todayButton);
    expect(onPressStamp).not.toHaveBeenCalled();
  });

  test("hides records outside the last 7 days", async () => {
    await render(
      <RallyTile {...defaultProps} stampDates={[at(13), at(14), at(20)]} />,
    );

    expect(screen.getByLabelText("Sep 14, 2026, recorded")).toBeOnTheScreen();
    expect(screen.queryByLabelText("Sep 13, 2026, recorded")).toBeNull();
  });

  test("stamp and detail buttons call their callbacks", async () => {
    const onPressStamp = jest.fn();
    const onPressDetail = jest.fn();
    const user = userEvent.setup();

    await render(
      <RallyTile
        {...defaultProps}
        onPressStamp={onPressStamp}
        onPressDetail={onPressDetail}
      />,
    );

    await user.press(
      screen.getByRole("button", { name: "Stamp Kyoto trip for today" }),
    );
    await user.press(
      screen.getByRole("button", { name: "View Kyoto trip details" }),
    );

    expect(onPressStamp).toHaveBeenCalledTimes(1);
    expect(onPressDetail).toHaveBeenCalledTimes(1);
  });
});
