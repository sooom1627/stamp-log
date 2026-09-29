import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import {
  act,
  fireEvent,
  screen,
  userEvent,
} from "@testing-library/react-native";
import { toast } from "sonner-native";

import { listRallies, saveRally } from "../../db/rallies-db";
import { listStamps, saveStamp } from "../../db/stamps-db";

jest.useFakeTimers();

const now = new Date(2026, 8, 20, 15, 0);

beforeEach(() => {
  jest.setSystemTime(now);
  jest.mocked(toast).mockClear();
});

async function openPastStamp(name: string) {
  await saveRally({ name, type: "person" });
  const rally = (await listRallies()).find(
    (candidate) => candidate.name === name,
  );
  if (!rally) throw new Error(`Rally ${name} not found`);

  await renderRouter("./src/app");
  expect(await screen.findByText(name)).toBeOnTheScreen();
  await act(() => {
    router.push(`/add-past-stamp?rallyId=${rally.id}`);
  });
  expect(await screen.findByTestId("add-past-stamp-form")).toBeOnTheScreen();

  return { rally, user: userEvent.setup() };
}

async function pickDate(testID: string, date: Date) {
  await fireEvent(screen.getByTestId(testID), "dateChange", {
    nativeEvent: { date: date.toISOString() },
  });
}

async function stampsOf(rallyId: number) {
  return (await listStamps()).filter((stamp) => stamp.rallyId === rallyId);
}

describe("S-025 T-001 ST-005 past stamp formSheet", () => {
  test("keeps Save inside intrinsically sized content with the rally name", async () => {
    await openPastStamp("Sheet layout rally");

    const form = screen.getByTestId("add-past-stamp-form");
    expect(form).not.toHaveProp("className", expect.stringContaining("flex-1"));
    expect(screen.getAllByText("Sheet layout rally").length).toBeGreaterThan(0);
    expect(screen.getByTestId("past-stamp-date")).toBeOnTheScreen();
    expect(screen.getByTestId("past-stamp-time")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });

  test("saves yesterday 12:00 by default and shows the memo toast", async () => {
    const { rally, user } = await openPastStamp("Default past rally");

    await user.press(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByRole("button", {
        name: "View Default past rally details",
      }),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId("add-past-stamp-form")).not.toBeOnTheScreen();
    const [stamp] = await stampsOf(rally.id);
    expect(stamp.stampedAt).toBe(new Date(2026, 8, 19, 12, 0).toISOString());
    expect(toast).toHaveBeenCalledWith(
      "Add a memo?",
      expect.objectContaining({
        duration: 5000,
        action: { label: "Add memo", onClick: expect.any(Function) },
      }),
    );
  });

  test("saves the picked date and time, even long before the rally existed", async () => {
    const { rally, user } = await openPastStamp("Old memory rally");

    await pickDate("past-stamp-date", new Date(2020, 0, 2, 9, 0));
    await pickDate("past-stamp-time", new Date(2026, 8, 20, 8, 15));
    await user.press(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByRole("button", {
        name: "View Old memory rally details",
      }),
    ).toBeOnTheScreen();
    const [stamp] = await stampsOf(rally.id);
    expect(stamp.stampedAt).toBe(new Date(2020, 0, 2, 8, 15).toISOString());
  });

  test("cannot save a future date and time", async () => {
    const { rally, user } = await openPastStamp("Future rally");

    await pickDate("past-stamp-date", now);
    await pickDate("past-stamp-time", new Date(2026, 8, 20, 18, 0));

    expect(screen.getByText("Future times can't be saved.")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    await user.press(screen.getByRole("button", { name: "Save" }));
    expect(await stampsOf(rally.id)).toHaveLength(0);
  });

  test("cannot save on a day the rally already has a stamp", async () => {
    await saveRally({ name: "Same day rally", type: "place" });
    const rally = (await listRallies()).find(
      (candidate) => candidate.name === "Same day rally",
    );
    if (!rally) throw new Error("Rally not found");
    await saveStamp({
      rallyId: rally.id,
      stampedAt: new Date(2026, 8, 19, 20, 30).toISOString(),
    });

    await renderRouter("./src/app");
    expect(await screen.findByText("Same day rally")).toBeOnTheScreen();
    await act(() => {
      router.push(`/add-past-stamp?rallyId=${rally.id}`);
    });

    expect(
      await screen.findByText("This rally already has a stamp on this day."),
    ).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();

    await pickDate("past-stamp-date", new Date(2026, 8, 18, 0, 0));
    expect(
      screen.queryByText("This rally already has a stamp on this day."),
    ).not.toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });
});
