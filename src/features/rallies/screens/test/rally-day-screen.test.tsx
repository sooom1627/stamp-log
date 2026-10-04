import { Alert, type AlertButton } from "react-native";

import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react-native";

import { listRallies, saveRally } from "../../db/rallies-db";
import { listStamps, saveStamp, updateStampMemo } from "../../db/stamps-db";

jest.useFakeTimers();

beforeEach(() => {
  jest.setSystemTime(new Date(2026, 8, 20, 15, 0));
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

const at = (day: number, hours: number, minutes = 0) =>
  new Date(2026, 8, day, hours, minutes).toISOString();

async function openRallyDay(name: string, date: string) {
  await saveRally({ name, type: "place", emoji: "🗼" });
  const [rally] = await listRallies();
  const lab = await saveStamp({ rallyId: rally.id, stampedAt: at(18, 19, 2) });
  await updateStampMemo({ id: lab.id, memo: "Talked in the lab" });
  await saveStamp({ rallyId: rally.id, stampedAt: at(17, 9) });

  await saveRally({ name: "Other", type: "place", emoji: "🎨" });
  const other = (await listRallies()).find(
    (candidate) => candidate.name === "Other",
  );
  if (!other) throw new Error("Other rally not found");
  await saveStamp({ rallyId: other.id, stampedAt: at(18, 8) });

  await renderRouter("./src/app");
  expect(await screen.findByText(name)).toBeOnTheScreen();
  await act(() => {
    router.push(`/rally-day?rallyId=${rally.id}&date=${date}`);
  });

  return { rally, lab };
}

describe("S-028 T-004 ST-003 rally day sheet", () => {
  test("shows only this rally's stamps of the day with their time", async () => {
    await openRallyDay("Rally day", "2026-09-18");

    const sheet = await screen.findByTestId("rally-day-sheet");
    expect(screen.getByText("Friday")).toBeOnTheScreen();
    expect(
      screen.getByRole("heading", { name: "Sep 18, 2026" }),
    ).toBeOnTheScreen();
    expect(screen.getByText("7:02 PM")).toBeOnTheScreen();
    expect(screen.getByText("Talked in the lab")).toBeOnTheScreen();
    // The Sep 17 stamp and the other rally's Sep 18 stamp stay out.
    expect(screen.queryByText("9:00 AM")).not.toBeOnTheScreen();
    expect(screen.queryByText("8:00 AM")).not.toBeOnTheScreen();
    expect(sheet).toBeOnTheScreen();
  });

  test("S-028 RT-002 ST-002 pads the top by a fixed amount, not the header height", async () => {
    await openRallyDay("Rally day layout", "2026-09-18");

    const sheet = await screen.findByTestId("rally-day-sheet");
    expect(sheet).toHaveProp("className", expect.stringContaining("pt-8"));
    expect(sheet).not.toHaveProp("style", expect.anything());
    expect(
      within(sheet).getByRole("heading", { name: "Sep 18, 2026" }),
    ).toBeOnTheScreen();
    expect(within(sheet).getByText("Friday")).toBeOnTheScreen();
  });

  test("deletes a stamp of the day after confirmation", async () => {
    const { lab } = await openRallyDay("Rally day delete", "2026-09-18");

    await fireEvent(
      await screen.findByTestId(`stamp-delete-${lab.id}`),
      "buttonPress",
    );
    const buttons: AlertButton[] =
      jest.mocked(Alert.alert).mock.calls.at(-1)?.[2] ?? [];
    await act(async () => {
      buttons.find((button) => button.style === "destructive")?.onPress?.();
    });

    // The list refetches after the deletion invalidates the stamps query.
    await waitFor(() => {
      expect(screen.queryByText("7:02 PM")).not.toBeOnTheScreen();
    });
    expect(screen.getByTestId("rally-day-sheet")).toBeOnTheScreen();
    expect((await listStamps()).some((stamp) => stamp.id === lab.id)).toBe(
      false,
    );
  });
});

describe("S-028 T-004 ST-005 empty rally day", () => {
  test("offers Stamp this day on an empty day and shows the new stamp after saving", async () => {
    await openRallyDay("Empty day", "2026-09-15");

    expect(await screen.findByText("No stamp on this day")).toBeOnTheScreen();
    await fireEvent.press(
      screen.getByRole("button", { name: "Stamp this day" }),
    );

    expect(await screen.findByTestId("add-past-stamp-form")).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("12:00 PM")).toBeOnTheScreen();
    expect(screen.getByTestId("rally-day-sheet")).toBeOnTheScreen();
    expect(screen.queryByText("No stamp on this day")).not.toBeOnTheScreen();
    expect(
      screen.queryByRole("button", { name: "Stamp this day" }),
    ).not.toBeOnTheScreen();
  });

  test("does not offer Stamp this day on a day that already has a stamp", async () => {
    await openRallyDay("Recorded day", "2026-09-18");

    expect(await screen.findByText("7:02 PM")).toBeOnTheScreen();
    expect(
      screen.queryByRole("button", { name: "Stamp this day" }),
    ).not.toBeOnTheScreen();
  });
});

describe("S-028 RT-001 ST-006 rally day look", () => {
  test("tints the weekday and draws the empty day on a flat accent panel", async () => {
    await openRallyDay("Day look", "2026-09-15");

    expect(await screen.findByText("Tuesday")).toHaveProp(
      "className",
      expect.stringContaining("text-accent-strong"),
    );
    const empty = screen.getByTestId("rally-day-empty");
    expect(empty).toHaveProp(
      "className",
      expect.stringContaining("bg-accent-subtle"),
    );
    expect(screen.getByText("No stamp on this day")).toHaveProp(
      "className",
      expect.stringContaining("text-accent-strong"),
    );
  });
});
