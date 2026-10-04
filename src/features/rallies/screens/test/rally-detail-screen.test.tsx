import { Alert, type AlertButton } from "react-native";

import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import {
  act,
  fireEvent,
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";
import { toast } from "sonner-native";

import { formatStampDateTime } from "@/shared/utils/format-stamp-date-time";

import * as ralliesDb from "../../db/rallies-db";
import * as stampsDb from "../../db/stamps-db";
import { listStamps, saveStamp, updateStampMemo } from "../../db/stamps-db";

jest.useFakeTimers();

beforeEach(() => {
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

function findAlertButton(style: AlertButton["style"]): AlertButton {
  const buttons = jest.mocked(Alert.alert).mock.calls.at(-1)?.[2] ?? [];
  const button = buttons.find((candidate) => candidate.style === style);
  if (!button) throw new Error(`Alert button with style ${style} not found`);
  return button;
}

async function openRallyDetail(
  name: string,
  seed?: (rallyId: number) => Promise<void>,
) {
  await ralliesDb.saveRally({ name, type: "place", emoji: "🗼" });
  const [rally] = await ralliesDb.listRallies();
  await saveStamp({ rallyId: rally.id });
  await seed?.(rally.id);

  await renderRouter("./src/app");
  expect(await screen.findByText(name)).toBeOnTheScreen();
  await act(() => {
    router.push(`/rallies/${rally.id}`);
  });

  return { rally, user: userEvent.setup() };
}

describe("Rally detail", () => {
  test("shows the selected rally and its stamp count", async () => {
    await openRallyDetail("Tokyo towers");

    expect(await screen.findByLabelText("Rally detail")).toBeOnTheScreen();
    expect(screen.getByText("🗼")).toBeOnTheScreen();
    expect(
      screen.getByRole("heading", { name: "Tokyo towers" }),
    ).toBeOnTheScreen();
    expect(screen.getByText("1 stamp")).toBeOnTheScreen();
  });
});

function daysAgoAt(days: number, hours: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
}

const stampDateTimePattern = / (AM|PM)$/;

describe("S-006 T-001 ST-003 stamp timeline", () => {
  test("shows this rally's stamps newest first with the memo in full", async () => {
    const oneDayAgo = daysAgoAt(1, 12);
    const threeDaysAgo = daysAgoAt(3, 12);
    const { rally } = await openRallyDetail("Timeline", async (rallyId) => {
      const withMemo = await saveStamp({ rallyId, stampedAt: oneDayAgo });
      await updateStampMemo({ id: withMemo.id, memo: "Talked in the lab" });
      await saveStamp({ rallyId, stampedAt: threeDaysAgo });
    });
    const [now] = (await listStamps())
      .filter((stamp) => stamp.rallyId === rally.id)
      .map((stamp) => stamp.stampedAt);

    const dateTimes = await screen.findAllByText(stampDateTimePattern);
    expect(dateTimes).toHaveLength(3);
    [now, oneDayAgo, threeDaysAgo].forEach((stampedAt, index) => {
      expect(dateTimes[index]).toHaveTextContent(
        formatStampDateTime(new Date(stampedAt)),
      );
    });
    expect(screen.getByText("Talked in the lab")).toBeOnTheScreen();
    expect(screen.getAllByText(/Talked/)).toHaveLength(1);
  });

  test("does not show stamps of other rallies", async () => {
    await ralliesDb.saveRally({ name: "Other", type: "place", emoji: "🎨" });
    const [other] = await ralliesDb.listRallies();
    await saveStamp({ rallyId: other.id });

    await openRallyDetail("Own stamps only");

    expect(await screen.findAllByText(stampDateTimePattern)).toHaveLength(1);
  });
});

describe("S-006 T-001 ST-008 delete stamp from the timeline", () => {
  async function openWithTwoStamps(name: string) {
    const { rally } = await openRallyDetail(name, async (rallyId) => {
      await saveStamp({ rallyId, stampedAt: daysAgoAt(1, 12) });
    });
    expect(await screen.findByText("2 stamps")).toBeOnTheScreen();
    // listStamps is newest first, so the last one is the stamp from yesterday.
    const pastStamp = (await stampsOf(rally.id)).at(-1);
    if (!pastStamp) throw new Error("Past stamp not found");
    await fireEvent(
      screen.getByTestId(`stamp-delete-${pastStamp.id}`),
      "buttonPress",
    );
    return { rally, pastStamp };
  }

  async function stampsOf(rallyId: number) {
    return (await listStamps()).filter((stamp) => stamp.rallyId === rallyId);
  }

  test("deletes the stamp after confirmation and stays on rally detail", async () => {
    const { rally, pastStamp } = await openWithTwoStamps("Delete stamp");

    expect(Alert.alert).toHaveBeenCalledWith(
      "Delete stamp?",
      "This action cannot be undone.",
      expect.any(Array),
    );
    await act(async () => {
      findAlertButton("destructive").onPress?.();
    });

    expect(await screen.findByText("1 stamp")).toBeOnTheScreen();
    expect(screen.getAllByText(stampDateTimePattern)).toHaveLength(1);
    expect(
      screen.queryByText(formatStampDateTime(new Date(pastStamp.stampedAt))),
    ).not.toBeOnTheScreen();
    expect(screen.getByLabelText("Rally detail")).toBeOnTheScreen();
    expect(
      (await stampsOf(rally.id)).some((stamp) => stamp.id === pastStamp.id),
    ).toBe(false);
  });

  test("keeps the stamp when the deletion is cancelled", async () => {
    const { rally } = await openWithTwoStamps("Cancel stamp delete");

    await act(async () => {
      findAlertButton("cancel").onPress?.();
    });

    expect(screen.getByText("2 stamps")).toBeOnTheScreen();
    expect(await stampsOf(rally.id)).toHaveLength(2);
  });

  test("shows the global error toast when deletion fails", async () => {
    jest
      .spyOn(stampsDb, "deleteStamp")
      .mockRejectedValueOnce(new Error("delete failed"));
    const { rally } = await openWithTwoStamps("Stamp delete fails");

    await act(async () => {
      findAlertButton("destructive").onPress?.();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
      );
    });
    expect(screen.getByText("2 stamps")).toBeOnTheScreen();
    expect(await stampsOf(rally.id)).toHaveLength(2);
  });
});

describe("S-006 T-001 ST-009 empty and error states", () => {
  async function openWithoutStamps(name: string) {
    await ralliesDb.saveRally({ name, type: "place", emoji: "🗼" });
    const [rally] = await ralliesDb.listRallies();

    await renderRouter("./src/app");
    expect(await screen.findByText(name)).toBeOnTheScreen();
    await act(() => {
      router.push(`/rallies/${rally.id}`);
    });

    return { rally, detail: await screen.findByLabelText("Rally detail") };
  }

  test("shows No stamps yet when the rally has no stamps", async () => {
    const { detail } = await openWithoutStamps("Empty timeline");

    expect(await within(detail).findByText("No stamps yet")).toBeOnTheScreen();
    expect(within(detail).getByText("0 stamps")).toBeOnTheScreen();
    expect(within(detail).queryAllByText(stampDateTimePattern)).toHaveLength(0);
  });

  test("shows a load error with Retry instead of the empty state", async () => {
    jest
      .spyOn(stampsDb, "listStamps")
      .mockRejectedValue(new Error("disk full"));
    const { detail } = await openWithoutStamps("Timeline load fails");

    expect(await within(detail).findByText("Couldn't load")).toBeOnTheScreen();
    expect(
      within(detail).getByRole("button", { name: "Retry" }),
    ).toBeOnTheScreen();
    expect(within(detail).queryByText("No stamps yet")).not.toBeOnTheScreen();
    expect(within(detail).queryByText("0 stamps")).not.toBeOnTheScreen();
  });

  test("shows the stamps after retrying a failed load", async () => {
    const realListStamps = stampsDb.listStamps;
    const listSpy = jest
      .spyOn(stampsDb, "listStamps")
      .mockRejectedValue(new Error("disk full"));
    const { rally, detail } = await openWithoutStamps("Timeline retry");
    await saveStamp({ rallyId: rally.id });
    expect(await within(detail).findByText("Couldn't load")).toBeOnTheScreen();

    listSpy.mockImplementation(realListStamps);
    const user = userEvent.setup();
    await user.press(within(detail).getByRole("button", { name: "Retry" }));

    expect(await within(detail).findByText("1 stamp")).toBeOnTheScreen();
    expect(within(detail).getAllByText(stampDateTimePattern)).toHaveLength(1);
    expect(within(detail).queryByText("Couldn't load")).not.toBeOnTheScreen();
  });
});

describe("S-006 T-001 ST-010 menu tap target", () => {
  test("gives the … menu label a 44pt tap target read as More", async () => {
    const { rally } = await openRallyDetail("Menu tap target");
    const [stamp] = (await listStamps()).filter(
      (candidate) => candidate.rallyId === rally.id,
    );

    expect(await screen.findByTestId(`stamp-menu-icon-${stamp.id}`)).toHaveProp(
      "modifiers",
      expect.arrayContaining([
        expect.objectContaining({ $type: "frame", width: 44, height: 44 }),
        expect.objectContaining({ $type: "contentShape" }),
        expect.objectContaining({ $type: "accessibilityLabel", label: "More" }),
      ]),
    );
  });
});

describe("S-006 T-002 ST-002 month calendar", () => {
  test("marks this rally's recorded days in the current month", async () => {
    jest.setSystemTime(new Date(2026, 8, 20, 12));
    await ralliesDb.saveRally({ name: "Other", type: "place", emoji: "🎨" });
    const [other] = await ralliesDb.listRallies();
    await saveStamp({
      rallyId: other.id,
      stampedAt: new Date(2026, 8, 10, 9).toISOString(),
    });

    const { user } = await openRallyDetail(
      "Calendar marks",
      async (rallyId) => {
        await saveStamp({
          rallyId,
          stampedAt: new Date(2026, 8, 2, 8).toISOString(),
        });
      },
    );

    expect(await screen.findByText("September 2026")).toBeOnTheScreen();
    // S-028: the calendar opens on this week; the whole month is one tap away.
    await user.press(screen.getByRole("button", { name: "Show month" }));
    expect(screen.getByLabelText("Sep 2, 2026, recorded")).toBeOnTheScreen();
    expect(screen.getByLabelText("Sep 20, 2026, recorded")).toBeOnTheScreen();
    expect(
      screen.getByLabelText("Sep 3, 2026, not recorded"),
    ).toBeOnTheScreen();
    expect(
      screen.getByLabelText("Sep 10, 2026, not recorded"),
    ).toBeOnTheScreen();
    expect(screen.getAllByLabelText(/, recorded$/)).toHaveLength(2);
  });
});

describe("S-006 T-002 ST-003 month navigation", () => {
  test("moves to the previous and next months with their recorded days", async () => {
    jest.setSystemTime(new Date(2026, 8, 20, 12));
    const { user } = await openRallyDetail(
      "Calendar months",
      async (rallyId) => {
        await saveStamp({
          rallyId,
          stampedAt: new Date(2026, 7, 15, 9).toISOString(),
        });
      },
    );
    expect(await screen.findByText("September 2026")).toBeOnTheScreen();
    // S-028: ‹ › step months in the month view.
    await user.press(screen.getByRole("button", { name: "Show month" }));

    await user.press(screen.getByRole("button", { name: "Previous month" }));

    expect(await screen.findByText("August 2026")).toBeOnTheScreen();
    expect(screen.getByLabelText("Aug 15, 2026, recorded")).toBeOnTheScreen();
    expect(screen.getAllByLabelText(/, recorded$/)).toHaveLength(1);

    await user.press(screen.getByRole("button", { name: "Next month" }));
    await user.press(screen.getByRole("button", { name: "Next month" }));

    expect(await screen.findByText("October 2026")).toBeOnTheScreen();
    expect(screen.queryAllByLabelText(/, recorded$/)).toHaveLength(0);
  });
});

describe("S-028 T-001 ST-001 rally actions menu", () => {
  test("puts a 44pt Rally actions menu with Past stamp and Delete rally in the header", async () => {
    await openRallyDetail("Header menu");

    expect(await screen.findByTestId("rally-actions-menu-icon")).toHaveProp(
      "modifiers",
      expect.arrayContaining([
        expect.objectContaining({ $type: "frame", width: 44, height: 44 }),
        expect.objectContaining({
          $type: "accessibilityLabel",
          label: "Rally actions",
        }),
      ]),
    );
    expect(screen.getByTestId("rally-action-past-stamp")).toHaveProp(
      "label",
      "Past stamp",
    );
    expect(screen.getByTestId("rally-action-delete")).toHaveProp(
      "label",
      "Delete rally",
    );
    expect(screen.getByTestId("rally-action-delete")).toHaveProp(
      "role",
      "destructive",
    );
  });
});

describe("S-028 T-001 ST-002 past stamp from the actions menu", () => {
  test("opens the past stamp formSheet and returns with the new stamp counted", async () => {
    const { rally, user } = await openRallyDetail("Menu past stamp");
    expect(await screen.findByText("1 stamp")).toBeOnTheScreen();

    await fireEvent(
      screen.getByTestId("rally-action-past-stamp"),
      "buttonPress",
    );

    expect(await screen.findByTestId("add-past-stamp-form")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("2 stamps")).toBeOnTheScreen();
    expect(screen.getByLabelText("Rally detail")).toBeOnTheScreen();
    expect(screen.queryByTestId("add-past-stamp-form")).not.toBeOnTheScreen();
    const stamps = (await listStamps()).filter(
      (stamp) => stamp.rallyId === rally.id,
    );
    expect(stamps).toHaveLength(2);
  });
});

describe("S-028 T-001 ST-003 delete rally from the actions menu", () => {
  async function pressMenuDelete(name: string) {
    const opened = await openRallyDetail(name);
    await fireEvent(
      await screen.findByTestId("rally-action-delete"),
      "buttonPress",
    );
    return opened;
  }

  test("deletes the rally after confirmation and returns home", async () => {
    const { rally } = await pressMenuDelete("Menu delete");

    expect(Alert.alert).toHaveBeenCalledWith(
      "Delete rally?",
      "This action cannot be undone.",
      expect.any(Array),
    );
    await act(async () => {
      findAlertButton("destructive").onPress?.();
    });

    await waitFor(() => {
      expect(screen.queryByLabelText("Rally detail")).not.toBeOnTheScreen();
    });
    expect(
      (await ralliesDb.listRallies()).some(
        (candidate) => candidate.id === rally.id,
      ),
    ).toBe(false);
  });

  test("keeps the rally when the deletion is cancelled", async () => {
    const { rally } = await pressMenuDelete("Menu delete cancel");

    await act(async () => {
      findAlertButton("cancel").onPress?.();
    });

    expect(screen.getByLabelText("Rally detail")).toBeOnTheScreen();
    expect(
      (await ralliesDb.listRallies()).some(
        (candidate) => candidate.id === rally.id,
      ),
    ).toBe(true);
  });

  test("shows the global error toast when deletion fails", async () => {
    jest
      .spyOn(ralliesDb, "deleteRally")
      .mockRejectedValueOnce(new Error("delete failed"));
    await pressMenuDelete("Menu delete fails");

    await act(async () => {
      findAlertButton("destructive").onPress?.();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
      );
    });
    expect(screen.getByLabelText("Rally detail")).toBeOnTheScreen();
  });
});

describe("S-028 T-001 ST-004 no footer actions", () => {
  test("leaves Past stamp and Delete rally to the header menu only", async () => {
    await openRallyDetail("No footer");

    expect(await screen.findByLabelText("Rally detail")).toBeOnTheScreen();
    expect(
      screen.queryByRole("button", { name: "Past stamp" }),
    ).not.toBeOnTheScreen();
    expect(
      screen.queryByRole("button", { name: "Delete No footer" }),
    ).not.toBeOnTheScreen();
  });
});

describe("S-028 T-001 ST-005 rally actions icon", () => {
  test("uses a native toolbar menu icon with no custom tint", async () => {
    await openRallyDetail("Round menu icon");

    const icon = await screen.findByTestId("rally-actions-menu-icon");
    expect(icon).toHaveProp("systemName", "ellipsis");
    expect(icon).not.toHaveProp("color");
  });
});

describe("S-028 T-002 ST-003 rally summary", () => {
  test("shows the first stamp day, weekly average and days since the last stamp, and updates them", async () => {
    jest.setSystemTime(new Date(2026, 8, 20, 12));
    const { rally } = await openRallyDetail("Summary", async (rallyId) => {
      await saveStamp({
        rallyId,
        stampedAt: new Date(2026, 7, 3, 9).toISOString(),
      });
      await saveStamp({
        rallyId,
        stampedAt: new Date(2026, 8, 18, 19).toISOString(),
      });
    });
    const summary = await screen.findByLabelText("Rally summary");

    // Aug 3 – Sep 20 is 7 weeks: 3 / 7 = 0.43 per week; the last stamp is today.
    expect(within(summary).getByText("First stamp")).toBeOnTheScreen();
    expect(within(summary).getByText("Aug 3, 2026")).toBeOnTheScreen();
    expect(within(summary).getByText("Per week")).toBeOnTheScreen();
    expect(within(summary).getByText("0.4")).toBeOnTheScreen();
    expect(within(summary).getByText("Last stamp")).toBeOnTheScreen();
    expect(within(summary).getByText("Today")).toBeOnTheScreen();

    const [todayStamp] = (await listStamps()).filter(
      (stamp) => stamp.rallyId === rally.id,
    );
    await fireEvent(
      screen.getByTestId(`stamp-delete-${todayStamp.id}`),
      "buttonPress",
    );
    await act(async () => {
      findAlertButton("destructive").onPress?.();
    });

    expect(await within(summary).findByText("2 days ago")).toBeOnTheScreen();
    expect(within(summary).getByText("0.3")).toBeOnTheScreen();
  });
});

describe("S-028 T-002 ST-004 rally summary without stamps", () => {
  async function openEmptyRally(name: string) {
    await ralliesDb.saveRally({ name, type: "place", emoji: "🗼" });
    const [rally] = await ralliesDb.listRallies();

    await renderRouter("./src/app");
    expect(await screen.findByText(name)).toBeOnTheScreen();
    await act(() => {
      router.push(`/rallies/${rally.id}`);
    });

    return screen.findByLabelText("Rally detail");
  }

  test("shows a dash for every value when the rally has no stamps", async () => {
    const detail = await openEmptyRally("Empty summary");

    const summary = await within(detail).findByLabelText("Rally summary");
    expect(within(summary).getByText("First stamp")).toBeOnTheScreen();
    expect(within(summary).getAllByText("—")).toHaveLength(3);
  });

  test("hides the summary when the stamps cannot be loaded", async () => {
    jest
      .spyOn(stampsDb, "listStamps")
      .mockRejectedValue(new Error("disk full"));
    const detail = await openEmptyRally("Summary load fails");

    expect(await within(detail).findByText("Couldn't load")).toBeOnTheScreen();
    expect(
      within(detail).queryByLabelText("Rally summary"),
    ).not.toBeOnTheScreen();
  });
});

describe("S-028 T-003 ST-003 week and month views", () => {
  test("opens on this week and toggles between the week and the whole month", async () => {
    jest.setSystemTime(new Date(2026, 8, 20, 12));
    const { user } = await openRallyDetail(
      "Folded calendar",
      async (rallyId) => {
        for (const day of [2, 18]) {
          await saveStamp({
            rallyId,
            stampedAt: new Date(2026, 8, day, 9).toISOString(),
          });
        }
      },
    );

    expect(await screen.findByText("September 2026")).toBeOnTheScreen();
    expect(
      screen.getByLabelText("Sep 14, 2026, not recorded"),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText("Sep 18, 2026, recorded")).toBeOnTheScreen();
    expect(screen.getAllByLabelText(/^Sep \d+, 2026, /)).toHaveLength(7);
    expect(
      screen.queryByLabelText("Sep 2, 2026, recorded"),
    ).not.toBeOnTheScreen();

    const showMonth = screen.getByRole("button", { name: "Show month" });
    expect(showMonth).toBeCollapsed();
    await user.press(showMonth);

    expect(screen.getByLabelText("Sep 2, 2026, recorded")).toBeOnTheScreen();
    expect(screen.getAllByLabelText(/^Sep \d+, 2026, /)).toHaveLength(30);
    const showWeek = screen.getByRole("button", { name: "Show week" });
    expect(showWeek).toBeExpanded();

    await user.press(showWeek);

    expect(
      screen.queryByLabelText("Sep 2, 2026, recorded"),
    ).not.toBeOnTheScreen();
    expect(screen.getAllByLabelText(/^Sep \d+, 2026, /)).toHaveLength(7);
  });
});
