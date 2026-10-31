import { useState, type ComponentProps } from "react";

import {
  act,
  fireEvent,
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

type CalendarProps = ComponentProps<typeof RallyMonthCalendar>;

// The screen keeps the shown month; here it starts on October 2026.
function Calendar({
  onChangeMonth,
  ...props
}: Omit<CalendarProps, "month" | "onChangeMonth"> & {
  onChangeMonth?: CalendarProps["onChangeMonth"];
}) {
  const [month, setMonth] = useState(new Date(2026, 9, 1));
  return (
    <RallyMonthCalendar
      {...props}
      month={month}
      onChangeMonth={(next) => {
        setMonth(next);
        onChangeMonth?.(next);
      }}
    />
  );
}

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
      <Calendar
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
      <Calendar stampDates={stampDates} dayMarks={dayMarks} />,
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
      <Calendar stampDates={stampDates} dayMarks={dayMarks} />,
    );

    expect(
      screen.getByRole("button", { name: "Oct 7, 2026, recorded, 3 stamps" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Oct 9, 2026, not recorded" }),
    ).toBeDisabled();
  });
});

describe("RT-003 ST-004 / S-051 ST-004 calendar tells the month it moves to", () => {
  test("asks for the next or previous month with ‹ ›", async () => {
    const onChangeMonth = jest.fn();
    await renderCalendar(
      <Calendar stampDates={[]} onChangeMonth={onChangeMonth} />,
    );
    const user = userEvent.setup();

    await user.press(screen.getByRole("button", { name: "Next month" }));
    expect(onChangeMonth).toHaveBeenLastCalledWith(new Date(2026, 10, 1));

    await user.press(screen.getByRole("button", { name: "Previous month" }));
    expect(onChangeMonth).toHaveBeenLastCalledWith(new Date(2026, 9, 1));
  });

  test("starts the year wheel at the first stamp's year when only some stamps are given", async () => {
    await renderCalendar(
      <Calendar
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
    const onChangeMonth = jest.fn();
    await renderCalendar(
      <Calendar
        testID="logs-calendar"
        stampDates={[]}
        onChangeMonth={onChangeMonth}
      />,
    );

    await act(() => swipe(-80));
    // The month turns once the days have slid out.
    expect(await screen.findByText("November 2026")).toBeOnTheScreen();
    expect(onChangeMonth).toHaveBeenLastCalledWith(new Date(2026, 10, 1));

    await act(() => swipe(80));
    expect(await screen.findByText("October 2026")).toBeOnTheScreen();
    await act(() => swipe(80));
    expect(await screen.findByText("September 2026")).toBeOnTheScreen();
  });

  test("stays on the month after a short drag", async () => {
    await renderCalendar(<Calendar testID="logs-calendar" stampDates={[]} />);

    await act(() => swipe(-20));
    await act(() => jest.runAllTicks());

    expect(screen.getByText("October 2026")).toBeOnTheScreen();
  });
});

describe("S-051 T-002 ST-002 the calendar follows the finger", () => {
  const drag = (translationX: number, velocityX: number) =>
    fireGestureHandler(getByGestureTestId("logs-calendar-swipe"), [
      { state: State.BEGAN },
      { state: State.ACTIVE, translationX, velocityX },
      { state: State.END, translationX, velocityX },
    ]);

  test("turns the month on a quick flick even when the finger moved little", async () => {
    await renderCalendar(<Calendar testID="logs-calendar" stampDates={[]} />);

    await act(() => drag(-25, -800));

    expect(await screen.findByText("November 2026")).toBeOnTheScreen();
  });

  test("stays on the month after a short slow drag", async () => {
    await renderCalendar(<Calendar testID="logs-calendar" stampDates={[]} />);

    await act(() => drag(25, 100));
    await act(() => jest.runAllTicks());

    expect(screen.getByText("October 2026")).toBeOnTheScreen();
  });
});

describe("S-051 T-003 ST-003 months as pages side by side", () => {
  const hidden = { includeHiddenElements: true };
  const drag = (translationX: number) =>
    fireGestureHandler(getByGestureTestId("logs-calendar-swipe"), [
      { state: State.BEGAN },
      { state: State.ACTIVE, translationX },
      { state: State.END, translationX },
    ]);
  // The pages take the calendar's width once it is laid out.
  const layOut = (width: number) =>
    fireEvent(screen.getByTestId("logs-calendar-pages"), "layout", {
      nativeEvent: { layout: { x: 0, y: 0, width, height: 300 } },
    });

  test("fills the empty cells with the days around the month, dimmed and not pressable", async () => {
    await renderCalendar(
      <Calendar
        testID="logs-calendar"
        stampDates={[new Date(2026, 8, 29, 9).toISOString()]}
        onPressDay={jest.fn()}
      />,
    );

    const page = within(screen.getByTestId("logs-calendar-month-2026-10"));
    // October 2026 starts on Thursday and ends on Saturday.
    expect(
      page.getByTestId("calendar-outside-day-2026-09-28", hidden),
    ).toHaveTextContent("28");
    expect(
      page.getByTestId("calendar-outside-day-2026-11-01", hidden),
    ).toHaveTextContent("1");
    // A stamp in the next or previous month is shown on that month's page.
    expect(page.queryByText(/^\+/, hidden)).toBeNull();
    expect(
      page.queryByRole("button", { name: /^Sep 28, 2026/ }),
    ).not.toBeOnTheScreen();
  });

  test("lays the previous and next months beside the shown one, weekdays included", async () => {
    await renderCalendar(<Calendar testID="logs-calendar" stampDates={[]} />);

    const shown = screen.getByTestId("logs-calendar-month-2026-10");
    expect(within(shown).getByText("Mon")).toBeOnTheScreen();
    // The pages beside it are off screen, so they are not read out.
    expect(
      screen.getByTestId("logs-calendar-month-2026-09", hidden),
    ).toBeTruthy();
    expect(
      screen.getByTestId("logs-calendar-month-2026-11", hidden),
    ).toBeTruthy();
    expect(
      screen.queryByTestId("logs-calendar-month-2026-09"),
    ).not.toBeOnTheScreen();

    await userEvent
      .setup()
      .press(screen.getByRole("button", { name: "Previous month" }));

    expect(screen.getByTestId("logs-calendar-month-2026-09")).toBeOnTheScreen();
    expect(
      screen.getByTestId("logs-calendar-month-2026-08", hidden),
    ).toBeTruthy();
  });

  test("snaps to the next month after a quarter of the width, and back before it", async () => {
    await renderCalendar(<Calendar testID="logs-calendar" stampDates={[]} />);
    await layOut(320);

    await act(() => drag(-70));
    await act(() => jest.runAllTicks());
    expect(screen.getByText("October 2026")).toBeOnTheScreen();

    await act(() => drag(-80));
    expect(await screen.findByText("November 2026")).toBeOnTheScreen();
  });
});
