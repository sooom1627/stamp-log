import {
  act,
  render,
  screen,
  userEvent,
  within,
} from "@testing-library/react-native";
import { GestureHandlerRootView, State } from "react-native-gesture-handler";
import {
  fireGestureHandler,
  getByGestureTestId,
} from "react-native-gesture-handler/jest-utils";

import { type DayMark } from "@/shared/utils/month-grid";

import { RallyMonthCalendar } from "../rally-month-calendar";

jest.useFakeTimers();

beforeEach(() => {
  // Saturday, October 10, 2026: the month shown is October 2026.
  jest.setSystemTime(new Date(2026, 9, 10, 12));
});

// The calendar's swipe needs the gesture root the app layout gives it.
const renderCalendar = (ui: React.ReactElement) =>
  render(ui, { wrapper: GestureHandlerRootView });

const at = (day: number, hours: number) =>
  new Date(2026, 9, day, hours).toISOString();

describe("S-011 T-001 ST-002 calendar with a mark per day", () => {
  const stampDates = [at(7, 18), at(7, 9), at(7, 6), at(8, 19)];
  const dayMarks = new Map<string, DayMark>([
    ["2026-10-07", { emoji: "☕", extraCount: 2 }],
    ["2026-10-08", { emoji: "🔬", extraCount: 0 }],
  ]);

  test("shows each day's emoji and +N on days with more than one stamp", async () => {
    await renderCalendar(
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
    await renderCalendar(
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
    await renderCalendar(
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

describe("RT-003 ST-004 calendar tells the range it shows", () => {
  test("reports the shown month as local midnights, end left out", async () => {
    const onVisibleRangeChange = jest.fn();
    await renderCalendar(
      <RallyMonthCalendar
        stampDates={[]}
        onVisibleRangeChange={onVisibleRangeChange}
      />,
    );
    const user = userEvent.setup();

    await user.press(screen.getByRole("button", { name: "Next month" }));
    expect(onVisibleRangeChange).toHaveBeenLastCalledWith({
      start: new Date(2026, 10, 1),
      end: new Date(2026, 11, 1),
    });

    await user.press(screen.getByRole("button", { name: "Previous month" }));
    expect(onVisibleRangeChange).toHaveBeenLastCalledWith({
      start: new Date(2026, 9, 1),
      end: new Date(2026, 10, 1),
    });
  });

  test("starts the year wheel at the first stamp's year when only some stamps are given", async () => {
    await renderCalendar(
      <RallyMonthCalendar
        stampDates={[at(7, 9)]}
        firstStampedAt={new Date(2023, 4, 1).toISOString()}
      />,
    );
    const user = userEvent.setup();

    await user.press(
      screen.getByRole("button", { name: "Choose month, October 2026" }),
    );

    const yearWheel = screen.getByTestId("month-picker-year");
    expect(yearWheel).toHaveProp("selection", 2026);
    // The wheel's rows are native views without text, so count them:
    // 2023 to next year (2027).
    const [rows] = yearWheel.children;
    expect(typeof rows === "string" ? [] : rows.children).toHaveLength(5);
  });
});

describe("S-051 T-001 ST-003 swipe the calendar to change months", () => {
  const swipe = (translationX: number) =>
    fireGestureHandler(getByGestureTestId("logs-calendar-swipe"), [
      { state: State.BEGAN },
      { state: State.ACTIVE, translationX },
      { state: State.END, translationX },
    ]);

  test("goes to the next month when swiped left and the previous when swiped right", async () => {
    const onVisibleRangeChange = jest.fn();
    await renderCalendar(
      <RallyMonthCalendar
        testID="logs-calendar"
        stampDates={[]}
        onVisibleRangeChange={onVisibleRangeChange}
      />,
    );

    await act(() => swipe(-80));
    expect(screen.getByText("November 2026")).toBeOnTheScreen();
    expect(onVisibleRangeChange).toHaveBeenLastCalledWith({
      start: new Date(2026, 10, 1),
      end: new Date(2026, 11, 1),
    });

    await act(() => swipe(80));
    await act(() => swipe(80));
    expect(screen.getByText("September 2026")).toBeOnTheScreen();
  });

  test("stays on the month after a short drag", async () => {
    await renderCalendar(
      <RallyMonthCalendar testID="logs-calendar" stampDates={[]} />,
    );

    await act(() => swipe(-20));

    expect(screen.getByText("October 2026")).toBeOnTheScreen();
  });
});
