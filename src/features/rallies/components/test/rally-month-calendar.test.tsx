import { render, screen, within } from "@testing-library/react-native";

import { type DayMark } from "../../utils/month-grid";
import { RallyMonthCalendar } from "../rally-month-calendar";

jest.useFakeTimers();

beforeEach(() => {
  // Saturday, October 10, 2026: the week shown is Oct 5–11.
  jest.setSystemTime(new Date(2026, 9, 10, 12));
});

const at = (day: number, hours: number) =>
  new Date(2026, 9, day, hours).toISOString();

describe("S-011 T-001 ST-002 calendar with a mark per day", () => {
  const stampDates = [at(7, 18), at(7, 9), at(7, 6), at(8, 19)];
  const dayMarks = new Map<string, DayMark>([
    ["2026-10-07", { emoji: "☕", extraCount: 2 }],
    ["2026-10-08", { emoji: "🔬", extraCount: 0 }],
  ]);

  test("shows each day's emoji and +N on days with more than one stamp", async () => {
    await render(
      <RallyMonthCalendar
        testID="logs-calendar"
        stampDates={stampDates}
        dayMarks={dayMarks}
      />,
    );

    const busyDay = screen.getByTestId("calendar-day-2026-10-07");
    expect(within(busyDay).getByText("☕")).toBeOnTheScreen();
    // +N is drawn only; the day's label reads the count.
    const hidden = { includeHiddenElements: true };
    expect(within(busyDay).getByText("+2", hidden)).toBeOnTheScreen();
    const singleDay = screen.getByTestId("calendar-day-2026-10-08");
    expect(within(singleDay).getByText("🔬")).toBeOnTheScreen();
    expect(within(singleDay).queryByText(/^\+/, hidden)).toBeNull();
    expect(screen.getByTestId("logs-calendar")).toBeOnTheScreen();
  });

  test("reads the number of stamps with the day", async () => {
    await render(
      <RallyMonthCalendar stampDates={stampDates} dayMarks={dayMarks} />,
    );

    expect(
      screen.getByRole("button", { name: "Oct 7, 2026, recorded, 3 stamps" }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "Oct 8, 2026, recorded, 1 stamp" }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "Oct 9, 2026, not recorded" }),
    ).toBeOnTheScreen();
  });

  test("cannot press a day when no day action is given", async () => {
    await render(
      <RallyMonthCalendar stampDates={stampDates} dayMarks={dayMarks} />,
    );

    expect(
      screen.getByRole("button", { name: "Oct 7, 2026, recorded, 3 stamps" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Oct 9, 2026, not recorded" }),
    ).toBeDisabled();
  });
});
