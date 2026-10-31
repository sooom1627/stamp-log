import { Alert, type AlertButton } from "react-native";

import { File, Paths } from "expo-file-system";
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

import * as ralliesDb from "@/shared/db/rallies-db";
import * as stampsDb from "@/shared/db/stamps-db";
import { listStamps, saveStamp, updateStampMemo } from "@/shared/db/stamps-db";
import { formatSpokenDate } from "@/shared/utils/format-spoken-date";
import {
  formatStampDay,
  formatStampTime,
} from "@/shared/utils/format-stamp-date-time";

jest.useFakeTimers();

// The native commands the pager sends to turn its page. Jest loads the
// package's CommonJS build, so spy on that copy.
const { Commands: PagerViewCommands } = jest.requireActual<
  typeof import("react-native-pager-view/lib/typescript/PagerViewNativeComponent")
>("react-native-pager-view/lib/commonjs/PagerViewNativeComponent");

// Photos the user picked in the library, saved onto the stamp (S-035).
let nextPickedPhotoId = 1;
async function attachPhotos(stampId: number, count: number) {
  const photoUris = Array.from({ length: count }, () => {
    const file = new File(
      Paths.cache,
      `post-picked-${nextPickedPhotoId++}.jpg`,
    );
    file.writeSync("jpeg with exif");
    return file.uri;
  });
  await updateStampMemo({ id: stampId, memo: "", photoUris });
}

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
  await ralliesDb.saveRally({ name, emoji: "🗼" });
  const [rally] = await ralliesDb.listRallies();
  await saveStamp({ rallyId: rally.id });
  await seed?.(rally.id);

  await renderRouter("./src/app");
  expect(
    await screen.findByRole("button", { name: `View ${name} details` }),
  ).toBeOnTheScreen();
  await act(() => {
    router.push(`/rallies/${rally.id}`);
  });
  // The rally's stamps are read when the screen opens.
  await within(await screen.findByLabelText("Rally detail")).findByText(
    /^\d+ stamps?$/,
  );

  return { rally, user: userEvent.setup() };
}

// The switch's segments are @expo/ui SwiftUI Text, which is not host text in
// Jest, so getByText cannot see them; read each native view's text prop.
function pickerSegments(detail: ReturnType<typeof within>) {
  const texts: string[] = [];
  const collect = (element: ReturnType<typeof screen.getByTestId> | string) => {
    if (typeof element === "string") return;
    if (typeof element.props.text === "string") texts.push(element.props.text);
    element.children.forEach(collect);
  };
  collect(detail.getByTestId("rally-view-picker"));
  return texts;
}

describe("Rally detail", () => {
  test("shows the selected rally and its stamp count", async () => {
    await openRallyDetail("Tokyo towers");

    expect(await screen.findByLabelText("Rally detail")).toBeOnTheScreen();
    // S-028: the emoji also marks recorded days in the calendar.
    expect(
      within(screen.getByTestId("rally-top-panel")).getByText("🗼"),
    ).toBeOnTheScreen();
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

// Logs keeps its own calendar mounted behind its tab, so calendar queries look
// inside rally detail's calendar only.
const rallyCalendar = () => within(screen.getByTestId("rally-calendar"));
const findRallyCalendar = async () =>
  within(await screen.findByTestId("rally-calendar"));

const stampDateTimePattern = /^\d{1,2}:\d{2}$/;
const stampDayPattern = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), /;

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

    // S-011: the day is a section heading (Today and Yesterday carry it
    // beside), and each post shows its time.
    // Logs also lists every stamp, so read the posts inside rally detail.
    const detail = within(await screen.findByLabelText("Rally detail"));
    const times = detail.getAllByText(stampDateTimePattern);
    const days = detail.getAllByText(stampDayPattern);
    expect(times).toHaveLength(3);
    expect(days).toHaveLength(3);
    [now, oneDayAgo, threeDaysAgo].forEach((stampedAt, index) => {
      expect(days[index]).toHaveTextContent(
        formatStampDay(new Date(stampedAt)),
      );
      expect(times[index]).toHaveTextContent(
        formatStampTime(new Date(stampedAt)),
      );
    });
    expect(detail.getByText("Talked in the lab")).toBeOnTheScreen();
    expect(detail.getAllByText(/Talked/)).toHaveLength(1);
  });

  test("does not show stamps of other rallies", async () => {
    await ralliesDb.saveRally({ name: "Other", emoji: "🎨" });
    const [other] = await ralliesDb.listRallies();
    await saveStamp({ rallyId: other.id });

    await openRallyDetail("Own stamps only");

    expect(
      within(await screen.findByLabelText("Rally detail")).getAllByText(
        stampDateTimePattern,
      ),
    ).toHaveLength(1);
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
      within(screen.getByLabelText("Rally detail")).getByTestId(
        `stamp-delete-${pastStamp.id}`,
      ),
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
    expect(
      within(screen.getByLabelText("Rally detail")).getAllByText(
        stampDateTimePattern,
      ),
    ).toHaveLength(1);
    expect(
      within(screen.getByLabelText("Rally detail")).queryByText(
        formatStampDay(new Date(pastStamp.stampedAt)),
      ),
    ).not.toBeOnTheScreen();
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
    await ralliesDb.saveRally({ name, emoji: "🗼" });
    const [rally] = await ralliesDb.listRallies();

    await renderRouter("./src/app");
    expect(
      await screen.findByRole("button", { name: `View ${name} details` }),
    ).toBeOnTheScreen();
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
      .spyOn(stampsDb, "listRallyStamps")
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
    const realListRallyStamps = stampsDb.listRallyStamps;
    const listSpy = jest
      .spyOn(stampsDb, "listRallyStamps")
      .mockRejectedValue(new Error("disk full"));
    const { rally, detail } = await openWithoutStamps("Timeline retry");
    await saveStamp({ rallyId: rally.id });
    expect(await within(detail).findByText("Couldn't load")).toBeOnTheScreen();

    listSpy.mockImplementation(realListRallyStamps);
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

    expect(
      within(await screen.findByLabelText("Rally detail")).getByTestId(
        `stamp-menu-icon-${stamp.id}`,
      ),
    ).toHaveProp(
      "modifiers",
      expect.arrayContaining([
        expect.objectContaining({ $type: "frame", width: 36, height: 36 }),
        expect.objectContaining({ $type: "imageScale", scale: "small" }),
        expect.objectContaining({ $type: "contentShape" }),
        expect.objectContaining({ $type: "accessibilityLabel", label: "More" }),
      ]),
    );
  });
});

describe("S-006 T-002 ST-002 month calendar", () => {
  test("marks this rally's recorded days in the current month", async () => {
    jest.setSystemTime(new Date(2026, 8, 20, 12));
    await ralliesDb.saveRally({ name: "Other", emoji: "🎨" });
    const [other] = await ralliesDb.listRallies();
    await saveStamp({
      rallyId: other.id,
      stampedAt: new Date(2026, 8, 10, 9).toISOString(),
    });

    await openRallyDetail("Calendar marks", async (rallyId) => {
      await saveStamp({
        rallyId,
        stampedAt: new Date(2026, 8, 2, 8).toISOString(),
      });
    });

    expect(
      await (await findRallyCalendar()).findByText("September 2026"),
    ).toBeOnTheScreen();
    expect(
      rallyCalendar().getByLabelText("Sep 2, 2026, recorded"),
    ).toBeOnTheScreen();
    expect(
      rallyCalendar().getByLabelText("Sep 20, 2026, recorded"),
    ).toBeOnTheScreen();
    expect(
      rallyCalendar().getByLabelText("Sep 3, 2026, not recorded"),
    ).toBeOnTheScreen();
    expect(
      rallyCalendar().getByLabelText("Sep 10, 2026, not recorded"),
    ).toBeOnTheScreen();
    expect(rallyCalendar().getAllByLabelText(/, recorded$/)).toHaveLength(2);
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
    expect(
      await (await findRallyCalendar()).findByText("September 2026"),
    ).toBeOnTheScreen();
    await user.press(
      rallyCalendar().getByRole("button", { name: "Previous month" }),
    );

    expect(
      await (await findRallyCalendar()).findByText("August 2026"),
    ).toBeOnTheScreen();
    expect(
      rallyCalendar().getByLabelText("Aug 15, 2026, recorded"),
    ).toBeOnTheScreen();
    expect(rallyCalendar().getAllByLabelText(/, recorded$/)).toHaveLength(1);

    await user.press(
      rallyCalendar().getByRole("button", { name: "Next month" }),
    );

    // September is this month, the last one the calendar goes to (T-004).
    expect(
      await (await findRallyCalendar()).findByText("September 2026"),
    ).toBeOnTheScreen();
    // Only the stamp the rally was opened with, today.
    expect(rallyCalendar().getAllByLabelText(/, recorded$/)).toHaveLength(1);
    expect(
      rallyCalendar().getByLabelText("Sep 20, 2026, recorded"),
    ).toBeOnTheScreen();
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
      expect.stringContaining("This action cannot be undone."),
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

describe("S-017 T-001 ST-003 confirm names the stamps deleted with the rally", () => {
  async function pressDelete() {
    await fireEvent(
      await screen.findByTestId("rally-action-delete"),
      "buttonPress",
    );
  }

  async function openEmptyRally(name: string) {
    await ralliesDb.saveRally({ name, emoji: "🗼" });
    const [rally] = await ralliesDb.listRallies();
    await renderRouter("./src/app");
    expect(
      await screen.findByRole("button", { name: `View ${name} details` }),
    ).toBeOnTheScreen();
    await act(() => {
      router.push(`/rallies/${rally.id}`);
    });
    expect(await screen.findByLabelText("Rally detail")).toBeOnTheScreen();
    return rally;
  }

  test("only warns that it cannot be undone when the rally has no stamps", async () => {
    const rally = await openEmptyRally("Delete empty");
    expect(await screen.findByText("No stamps yet")).toBeOnTheScreen();

    await pressDelete();

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

  test("says its one stamp will also be deleted", async () => {
    await openRallyDetail("Delete one stamp");
    expect(await screen.findByText("1 stamp")).toBeOnTheScreen();

    await pressDelete();

    expect(Alert.alert).toHaveBeenCalledWith(
      "Delete rally?",
      "Its 1 stamp will also be deleted. This action cannot be undone.",
      expect.any(Array),
    );
  });

  test("says how many stamps will also be deleted and deletes them with the rally", async () => {
    const { rally } = await openRallyDetail(
      "Delete three stamps",
      async (id) => {
        await saveStamp({ rallyId: id });
        await saveStamp({ rallyId: id });
      },
    );
    expect(await screen.findByText("3 stamps")).toBeOnTheScreen();

    await pressDelete();

    expect(Alert.alert).toHaveBeenCalledWith(
      "Delete rally?",
      "Its 3 stamps will also be deleted. This action cannot be undone.",
      expect.any(Array),
    );
    await act(async () => {
      findAlertButton("destructive").onPress?.();
    });
    await waitFor(() => {
      expect(screen.queryByLabelText("Rally detail")).not.toBeOnTheScreen();
    });
    expect(
      (await listStamps()).filter((stamp) => stamp.rallyId === rally.id),
    ).toHaveLength(0);
  });

  test("still says its stamps will be deleted when they could not be loaded", async () => {
    // Rally detail reads only this rally's stamps.
    jest
      .spyOn(stampsDb, "listRallyStamps")
      .mockRejectedValue(new Error("disk full"));
    await openEmptyRally("Delete unknown stamps");
    expect(await screen.findByText("Couldn't load")).toBeOnTheScreen();

    await pressDelete();

    expect(Alert.alert).toHaveBeenCalledWith(
      "Delete rally?",
      "Its stamps will also be deleted. This action cannot be undone.",
      expect.any(Array),
    );
  });
});

describe("S-017 T-001 ST-003 other screens drop the deleted rally's stamps", () => {
  async function saveRallyWithStamps(name: string, count: number) {
    await ralliesDb.saveRally({ name, emoji: "🧭" });
    const [rally] = await ralliesDb.listRallies();
    for (let index = 0; index < count; index += 1) {
      await saveStamp({ rallyId: rally.id });
    }
    return rally;
  }

  async function confirmDelete() {
    await fireEvent(
      await screen.findByTestId("rally-action-delete"),
      "buttonPress",
    );
    await act(async () => {
      findAlertButton("destructive").onPress?.();
    });
    await waitFor(() => {
      expect(screen.queryByLabelText("Rally detail")).not.toBeOnTheScreen();
    });
  }

  function homeTile(name: string) {
    const tile = screen
      .getAllByTestId("rally-tile")
      .find((candidate) => within(candidate).queryByText(name));
    if (!tile) throw new Error(`Tile for ${name} not found`);
    return within(tile);
  }

  function todayStampCount() {
    const label = screen.getByTestId("today-card").props["aria-label"];
    const match = /, (\d+) stamps?:/.exec(label);
    if (!match) throw new Error(`No count in ${label}`);
    return Number(match[1]);
  }

  test("Home drops the rally and today's count, and keeps other rallies' counts", async () => {
    await saveRallyWithStamps("Home kept", 1);
    const rally = await saveRallyWithStamps("Home deleted", 3);
    await renderRouter("./src/app");
    expect(
      await screen.findByRole("button", { name: "View Home deleted details" }),
    ).toBeOnTheScreen();
    expect(homeTile("Home deleted").getByText("3 stamps")).toBeOnTheScreen();
    expect(homeTile("Home kept").getByText("1 stamp")).toBeOnTheScreen();
    const todayBefore = todayStampCount();
    await act(() => {
      router.push(`/rallies/${rally.id}`);
    });
    expect(await screen.findByLabelText("Rally detail")).toBeOnTheScreen();

    await confirmDelete();

    expect(
      await screen.findByRole("button", { name: "View Home kept details" }),
    ).toBeOnTheScreen();
    expect(
      screen.queryByRole("button", { name: "View Home deleted details" }),
    ).not.toBeOnTheScreen();
    expect(homeTile("Home kept").getByText("1 stamp")).toBeOnTheScreen();
    await waitFor(() => {
      expect(todayStampCount()).toBe(todayBefore - 1);
    });
    expect(screen.getByTestId("today-card").props["aria-label"]).not.toContain(
      "Home deleted",
    );
  });

  test("Logs drops the rally's posts when it is deleted from a Logs post", async () => {
    await saveRallyWithStamps("Logs kept", 1);
    const rally = await saveRallyWithStamps("Logs deleted", 3);
    await renderRouter("./src/app");
    expect(
      await screen.findByRole("link", { name: "Create rally" }),
    ).toBeOnTheScreen();
    await act(() => {
      router.push("/records");
    });
    const logs = await screen.findByLabelText("Logs timeline");
    expect(within(logs).getAllByText("Logs deleted")).toHaveLength(3);
    await act(() => {
      router.push(`/records/rallies/${rally.id}`);
    });
    expect(await screen.findByLabelText("Rally detail")).toBeOnTheScreen();

    await confirmDelete();

    const logsAfter = within(screen.getByLabelText("Logs timeline"));
    await waitFor(() => {
      expect(logsAfter.queryByText("Logs deleted")).not.toBeOnTheScreen();
    });
    expect(logsAfter.getByText("Logs kept")).toBeOnTheScreen();
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
    // Logs also lists every stamp, so press Delete inside rally detail.
    await fireEvent(
      within(screen.getByLabelText("Rally detail")).getByTestId(
        `stamp-delete-${todayStamp.id}`,
      ),
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
    await ralliesDb.saveRally({ name, emoji: "🗼" });
    const [rally] = await ralliesDb.listRallies();

    await renderRouter("./src/app");
    expect(
      await screen.findByRole("button", { name: `View ${name} details` }),
    ).toBeOnTheScreen();
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
      .spyOn(stampsDb, "listRallyStamps")
      .mockRejectedValue(new Error("disk full"));
    const detail = await openEmptyRally("Summary load fails");

    expect(await within(detail).findByText("Couldn't load")).toBeOnTheScreen();
    expect(
      within(detail).queryByLabelText("Rally summary"),
    ).not.toBeOnTheScreen();
  });
});

describe("S-051 T-001 ST-002 month-only calendar", () => {
  test("always shows the whole month without a week view", async () => {
    jest.setSystemTime(new Date(2026, 8, 20, 12));
    await openRallyDetail("Month only", async (rallyId) => {
      await saveStamp({
        rallyId,
        stampedAt: new Date(2026, 8, 2, 9).toISOString(),
      });
    });

    expect(
      await (await findRallyCalendar()).findByText("September 2026"),
    ).toBeOnTheScreen();
    expect(rallyCalendar().getAllByLabelText(/^Sep \d+, 2026, /)).toHaveLength(
      30,
    );
    expect(
      rallyCalendar().getByLabelText("Sep 2, 2026, recorded"),
    ).toBeOnTheScreen();
    expect(
      rallyCalendar().queryByRole("button", { name: /^Show (month|week)$/ }),
    ).not.toBeOnTheScreen();
    expect(
      rallyCalendar().queryByRole("button", { name: /^(Previous|Next) week$/ }),
    ).not.toBeOnTheScreen();
  });

  test("steps by month with ‹ ›", async () => {
    jest.setSystemTime(new Date(2026, 9, 20, 12));
    const { user } = await openRallyDetail("Month steps");
    await user.press(
      await (
        await findRallyCalendar()
      ).findByRole("button", { name: "Previous month" }),
    );

    expect(rallyCalendar().getByText("September 2026")).toBeOnTheScreen();
    expect(rallyCalendar().getAllByLabelText(/^Sep \d+, 2026, /)).toHaveLength(
      30,
    );

    await user.press(
      rallyCalendar().getByRole("button", { name: "Next month" }),
    );

    expect(rallyCalendar().getByText("October 2026")).toBeOnTheScreen();
    expect(rallyCalendar().getAllByLabelText(/^Oct \d+, 2026, /)).toHaveLength(
      31,
    );
  });
});

describe("S-028 T-003 ST-005 month picker", () => {
  test("picks a year and month from the wheels and shows that month", async () => {
    jest.setSystemTime(new Date(2026, 8, 20, 12));
    const { user } = await openRallyDetail("Month picker", async (rallyId) => {
      await saveStamp({
        rallyId,
        stampedAt: new Date(2025, 2, 14, 9).toISOString(),
      });
    });

    await user.press(
      await (
        await findRallyCalendar()
      ).findByRole("button", {
        name: "Choose month, September 2026",
      }),
    );
    const monthWheel = await (
      await findRallyCalendar()
    ).findByTestId("month-picker-month");
    const yearWheel = rallyCalendar().getByTestId("month-picker-year");
    expect(monthWheel).toHaveProp("selection", 8);
    expect(yearWheel).toHaveProp("selection", 2026);

    await fireEvent(monthWheel, "selectionChange", {
      nativeEvent: { selection: 2 },
    });
    await fireEvent(yearWheel, "selectionChange", {
      nativeEvent: { selection: 2025 },
    });
    await fireEvent(
      rallyCalendar().getByTestId("month-picker-done"),
      "buttonPress",
    );

    expect(
      await (await findRallyCalendar()).findByText("March 2025"),
    ).toBeOnTheScreen();
    expect(rallyCalendar().getAllByLabelText(/^Mar \d+, 2025, /)).toHaveLength(
      31,
    );
    expect(
      rallyCalendar().getByLabelText("Mar 14, 2025, recorded"),
    ).toBeOnTheScreen();
    // The native sheet keeps its content until it reports the dismissal.
    expect(rallyCalendar().getByTestId("month-picker-sheet")).toHaveProp(
      "isPresented",
      false,
    );
    await fireEvent(
      rallyCalendar().getByTestId("month-picker-sheet"),
      "dismiss",
    );
    expect(
      rallyCalendar().queryByTestId("month-picker-month"),
    ).not.toBeOnTheScreen();
  });
});

describe("S-028 T-003 ST-005 month picker reopen", () => {
  test("starts from the shown month again after closing without Done", async () => {
    jest.setSystemTime(new Date(2026, 8, 20, 12));
    const { user } = await openRallyDetail("Picker reopen");
    const heading = await (
      await findRallyCalendar()
    ).findByRole("button", {
      name: "Choose month, September 2026",
    });

    await user.press(heading);
    await fireEvent(
      rallyCalendar().getByTestId("month-picker-month"),
      "selectionChange",
      {
        nativeEvent: { selection: 2 },
      },
    );
    // Swiping the sheet down reports the closed state from the native side.
    await fireEvent(
      rallyCalendar().getByTestId("month-picker-sheet"),
      "isPresentedChange",
      {
        nativeEvent: { isPresented: false },
      },
    );
    await fireEvent(
      rallyCalendar().getByTestId("month-picker-sheet"),
      "dismiss",
    );
    expect(rallyCalendar().getByText("September 2026")).toBeOnTheScreen();

    await user.press(heading);
    expect(
      await (await findRallyCalendar()).findByTestId("month-picker-month"),
    ).toHaveProp("selection", 8);
  });
});

describe("S-028 T-004 ST-006 open a day from the calendar", () => {
  test("opens the rally day sheet for a past day and keeps future days disabled", async () => {
    jest.setSystemTime(new Date(2026, 8, 16, 12));
    const { user } = await openRallyDetail("Calendar day", async (rallyId) => {
      await saveStamp({
        rallyId,
        stampedAt: new Date(2026, 8, 14, 9).toISOString(),
      });
    });

    const tomorrow = await (
      await findRallyCalendar()
    ).findByLabelText("Sep 17, 2026, not recorded");
    expect(tomorrow).toBeDisabled();
    await user.press(tomorrow);
    expect(screen.queryByTestId("rally-day-sheet")).not.toBeOnTheScreen();

    const recordedDay = rallyCalendar().getByRole("button", {
      name: "Sep 14, 2026, recorded",
    });
    await user.press(recordedDay);

    expect(await screen.findByTestId("rally-day-sheet")).toBeOnTheScreen();
    expect(
      screen.getByRole("heading", { name: "Sep 14, 2026" }),
    ).toBeOnTheScreen();
    expect(screen.getByText("9:00")).toBeOnTheScreen();
  });
});

describe("S-028 RT-001 ST-003 posts look", () => {
  test("titles the timeline Stamps with the count", async () => {
    jest.setSystemTime(new Date(2026, 8, 20, 12));
    await openRallyDetail("Posts look", async (rallyId) => {
      await saveStamp({
        rallyId,
        stampedAt: new Date(2026, 8, 18, 19, 2).toISOString(),
      });
    });

    const detail = within(await screen.findByLabelText("Rally detail"));
    // S-037: the Stamps heading became the Stamps / Album switch.
    expect(detail.getByTestId("rally-view-picker")).toHaveProp(
      "selection",
      "stamps",
    );
    expect(pickerSegments(detail)).toEqual(["Stamps · 2", "Album · 0"]);
    expect(screen.queryByText("Sep 18, 19:02")).not.toBeOnTheScreen();
  });
});

describe("S-011 RT-001 ST-007 rally detail day cards", () => {
  test("puts each day's posts on one card under its heading and titles each post with its time", async () => {
    jest.setSystemTime(new Date(2026, 8, 20, 12));
    let pastStampId = 0;
    await openRallyDetail("Day sections", async (rallyId) => {
      await saveStamp({
        rallyId,
        stampedAt: new Date(2026, 8, 19, 8).toISOString(),
      });
      const past = await saveStamp({
        rallyId,
        stampedAt: new Date(2026, 8, 18, 19, 2).toISOString(),
      });
      pastStampId = past.id;
    });

    const list = await screen.findByLabelText("Rally detail");
    // Headings scroll with their cards instead of sticking over the posts;
    // only the Stamps / Album switch (the second child) sticks (S-043 T-003).
    expect(list.props.stickyHeaderIndices).toEqual([1]);
    const detail = within(list);
    expect(
      within(detail.getByTestId("day-card-2026-09-18")).getByTestId(
        `stamp-row-${pastStampId}`,
      ),
    ).toBeOnTheScreen();
    expect(
      within(detail.getByTestId("day-card-2026-09-20")).queryByTestId(
        `stamp-row-${pastStampId}`,
      ),
    ).not.toBeOnTheScreen();
    expect(
      within(detail.getByTestId("day-section-2026-09-20")).getByRole("heading"),
    ).toHaveTextContent("Today");
    expect(
      within(detail.getByTestId("day-section-2026-09-19")).getByRole("heading"),
    ).toHaveTextContent("Yesterday");
    expect(
      within(detail.getByTestId("day-section-2026-09-18")).getByRole("heading"),
    ).toHaveTextContent("Fri, Sep 18");

    const post = within(detail.getByTestId(`stamp-row-${pastStampId}`));
    expect(post.getByText("19:02")).toHaveProp(
      "className",
      expect.stringContaining("font-semibold"),
    );
    expect(post.queryByText("Fri, Sep 18")).not.toBeOnTheScreen();
  });
});

describe("S-028 RT-001 ST-004 top panel look", () => {
  test("puts the rally name, count and summary on a flat accent panel with tiles", async () => {
    await openRallyDetail("Top panel");

    const panel = await screen.findByTestId("rally-top-panel");
    expect(panel).toHaveProp(
      "className",
      expect.stringContaining("bg-accent-subtle"),
    );
    expect(
      within(panel).getByRole("heading", { name: "Top panel" }),
    ).toBeOnTheScreen();
    expect(within(panel).getByText("1 stamp")).toHaveProp(
      "className",
      expect.stringContaining("text-accent-strong"),
    );
    const tiles = within(panel).getAllByTestId("rally-summary-tile");
    expect(tiles).toHaveLength(3);
    for (const tile of tiles) {
      expect(tile).toHaveProp(
        "className",
        expect.stringContaining("bg-background"),
      );
    }
  });
});

describe("S-028 RT-001 ST-005 calendar look", () => {
  test("draws a flat card with the rally emoji on recorded days and a ring on today", async () => {
    jest.setSystemTime(new Date(2026, 8, 16, 12));
    await openRallyDetail("Calendar look", async (rallyId) => {
      await saveStamp({
        rallyId,
        stampedAt: new Date(2026, 8, 14, 9).toISOString(),
      });
    });

    expect(await screen.findByTestId("rally-calendar-panel")).toHaveProp(
      "className",
      expect.stringContaining("bg-surface "),
    );
    const recorded = rallyCalendar().getByRole("button", {
      name: "Sep 14, 2026, recorded",
    });
    expect(within(recorded).getByText("🗼")).toBeOnTheScreen();
    expect(within(recorded).queryByText("14")).not.toBeOnTheScreen();
    expect(rallyCalendar().getByTestId("calendar-day-2026-09-14")).toHaveProp(
      "className",
      expect.stringContaining("bg-accent-soft"),
    );
    // Today (Sep 16) also has a stamp from openRallyDetail.
    expect(rallyCalendar().getByTestId("calendar-day-2026-09-16")).toHaveProp(
      "className",
      expect.stringContaining("border-accent"),
    );
    const future = rallyCalendar().getByLabelText("Sep 17, 2026, not recorded");
    expect(within(future).getByText("17")).toHaveProp(
      "className",
      expect.stringContaining("text-foreground-muted"),
    );
  });
});

describe("S-013 T-001 ST-005 edit rally from the actions menu", () => {
  test("lists Past stamp, Edit rally, Archive rally and Delete rally in that order", async () => {
    await openRallyDetail("Menu order");

    const actions = await screen.findAllByTestId(/^rally-action-/);

    expect(actions.map((action) => action.props.label)).toEqual([
      "Past stamp",
      "Edit rally",
      "Archive rally",
      "Delete rally",
    ]);
  });

  test("opens the edit sheet and shows the new name and emoji on detail and home", async () => {
    const { rally, user } = await openRallyDetail("Menu edit before");

    await fireEvent(
      await screen.findByTestId("rally-action-edit"),
      "buttonPress",
    );

    expect(await screen.findByTestId("edit-rally-form")).toBeOnTheScreen();
    expect(screen.getByLabelText("Name")).toHaveDisplayValue(
      "Menu edit before",
    );
    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Menu edit after");
    await user.press(
      screen.getByRole("button", { name: "Select emoji (currently 🗼)" }),
    );
    await user.press(screen.getByRole("button", { name: "Select 🔬" }));
    await user.press(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByRole("heading", { name: "Menu edit after" }),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId("edit-rally-form")).not.toBeOnTheScreen();
    const detail = screen.getByLabelText("Rally detail");
    // Top panel, the recorded day in the calendar and the post icon.
    expect(
      within(detail).getAllByText("🔬", { includeHiddenElements: true }),
    ).toHaveLength(3);
    expect(
      within(detail).queryAllByText("🗼", { includeHiddenElements: true }),
    ).toHaveLength(0);
    expect(
      within(screen.getByTestId("rally-calendar")).getByText("🔬"),
    ).toBeOnTheScreen();
    expect(await stampsOfRally(rally.id)).toHaveLength(1);

    await act(() => {
      router.back();
    });

    expect(
      await screen.findByRole("button", {
        name: "View Menu edit after details",
      }),
    ).toBeOnTheScreen();
  });
});

async function stampsOfRally(rallyId: number) {
  return (await listStamps()).filter((stamp) => stamp.rallyId === rallyId);
}

describe("S-033 T-002 ST-002 rally detail on the canvas", () => {
  test("paints rally detail with the canvas color and its calendar with the surface color", async () => {
    await openRallyDetail("Canvas detail");

    expect(await screen.findByLabelText("Rally detail")).toHaveProp(
      "className",
      expect.stringContaining("bg-canvas"),
    );
    expect(screen.getByTestId("rally-calendar-panel")).toHaveProp(
      "className",
      expect.stringContaining("bg-surface "),
    );
  });

  test("paints the rallies list with the canvas color", async () => {
    await renderRouter("./src/app");
    await act(() => {
      router.push("/rallies-list");
    });

    expect(await screen.findByLabelText("Rallies list")).toHaveProp(
      "className",
      expect.stringContaining("bg-canvas"),
    );
  });
});

describe("S-033 T-003 ST-001 transparent stack header", () => {
  // The native header's settings, found by the title it shows.
  function headerConfig(title: string) {
    const [config] = screen.container.queryAll(
      (instance) =>
        instance.type === "RNSScreenStackHeaderConfig" &&
        instance.props.title === title,
    );
    return config.props;
  }

  test("shows the canvas behind the rally detail header instead of a white bar", async () => {
    await openRallyDetail("Clear header");
    await screen.findByLabelText("Rally detail");

    const config = headerConfig("Clear header");
    expect(config.backgroundColor).toBe("transparent");
    expect(config.translucent).toBe(true);
  });

  test("shows the canvas behind the rallies list header", async () => {
    await renderRouter("./src/app");
    await act(() => {
      router.push("/rallies-list");
    });
    await screen.findByLabelText("Rallies list");

    const config = headerConfig("");
    expect(config.backgroundColor).toBe("transparent");
    expect(config.translucent).toBe(true);
  });
});

describe("S-032 T-001 ST-006 favorite star in the header", () => {
  async function isFavoriteSaved(rallyId: number) {
    const rallies = await ralliesDb.listRallies();
    return rallies.find((rally) => rally.id === rallyId)?.isFavorite;
  }

  test("sets the favorite from the star and stays on the rally", async () => {
    const { rally } = await openRallyDetail("Star on");

    const star = await screen.findByTestId("rally-favorite");
    expect(star).toHaveProp("label", "Add to favorites");
    expect(star).toHaveProp("systemImage", "star");

    await fireEvent(star, "buttonPress");

    await waitFor(() => {
      expect(screen.getByTestId("rally-favorite")).toHaveProp(
        "label",
        "Remove from favorites",
      );
    });
    expect(await isFavoriteSaved(rally.id)).toBe(true);
    expect(screen.getByTestId("rally-favorite")).toHaveProp(
      "systemImage",
      "star.fill",
    );
    expect(screen.getByRole("heading", { name: "Star on" })).toBeOnTheScreen();
  });

  test("clears the favorite when the star is pressed again", async () => {
    const { rally } = await openRallyDetail("Star off", (rallyId) =>
      ralliesDb.setRallyFavorite({ id: rallyId, isFavorite: true }),
    );

    const star = await screen.findByTestId("rally-favorite");
    expect(star).toHaveProp("label", "Remove from favorites");

    await fireEvent(star, "buttonPress");

    await waitFor(() => {
      expect(screen.getByTestId("rally-favorite")).toHaveProp(
        "label",
        "Add to favorites",
      );
    });
    expect(await isFavoriteSaved(rally.id)).toBe(false);
  });

  test("keeps the star out of the actions menu", async () => {
    await openRallyDetail("Star apart");

    const actions = await screen.findAllByTestId(/^rally-action-/);

    expect(actions.map((action) => action.props.label)).toEqual([
      "Past stamp",
      "Edit rally",
      "Archive rally",
      "Delete rally",
    ]);
  });
});

describe("S-039 T-002 ST-004 archive from the actions menu", () => {
  async function isArchivedSaved(rallyId: number) {
    const rallies = await ralliesDb.listRallies();
    return rallies.find((rally) => rally.id === rallyId)?.isArchived;
  }

  async function pressArchiveAction() {
    await fireEvent(screen.getByTestId("rally-action-archive"), "buttonPress");
  }

  test("archives without a confirmation and stays on the rally", async () => {
    const { rally } = await openRallyDetail("Archive me");
    const archiveAction = await screen.findByTestId("rally-action-archive");
    expect(archiveAction).toHaveProp("label", "Archive rally");
    expect(archiveAction).toHaveProp("systemImage", "archivebox");
    expect(screen.queryByText("Archived")).not.toBeOnTheScreen();

    await pressArchiveAction();

    expect(await screen.findByText("Archived")).toBeOnTheScreen();
    expect(await isArchivedSaved(rally.id)).toBe(true);
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(screen.getByTestId("rally-action-archive")).toHaveProp(
      "label",
      "Unarchive rally",
    );
    expect(
      screen.getByRole("heading", { name: "Archive me" }),
    ).toBeOnTheScreen();
  });

  test("unarchives an archived rally", async () => {
    const { rally } = await openRallyDetail("Bring me back");
    await screen.findByTestId("rally-action-archive");
    await pressArchiveAction();
    await waitFor(() => {
      expect(screen.getByTestId("rally-action-archive")).toHaveProp(
        "label",
        "Unarchive rally",
      );
    });

    await pressArchiveAction();

    await waitFor(() => {
      expect(screen.getByTestId("rally-action-archive")).toHaveProp(
        "label",
        "Archive rally",
      );
    });
    expect(screen.queryByText("Archived")).not.toBeOnTheScreen();
    await expect(isArchivedSaved(rally.id)).resolves.toBe(false);
  });
});

describe("S-035 ST-006 photo mark on posts", () => {
  test("marks only the posts with photos, with the count beside the time", async () => {
    let withPhotosId = 0;
    let withoutPhotosId = 0;
    await openRallyDetail("Photo marks", async (rallyId) => {
      const withPhotos = await saveStamp({
        rallyId,
        stampedAt: daysAgoAt(1, 12),
      });
      await attachPhotos(withPhotos.id, 3);
      withPhotosId = withPhotos.id;
      withoutPhotosId = (
        await saveStamp({ rallyId, stampedAt: daysAgoAt(2, 12) })
      ).id;
    });

    const detail = within(await screen.findByLabelText("Rally detail"));
    const marked = within(detail.getByTestId(`stamp-row-${withPhotosId}`));
    expect(marked.getByLabelText("3 photos. Show photos")).toHaveTextContent(
      "3",
    );
    const plain = within(detail.getByTestId(`stamp-row-${withoutPhotosId}`));
    expect(plain.queryByLabelText(/Show photos$/)).not.toBeOnTheScreen();
  });
});

describe("S-037 T-001 ST-003 the photo mark opens the photos", () => {
  test("opens the stamp's photos full screen from the first photo", async () => {
    await openRallyDetail("Detail viewer", async (rallyId) => {
      const stamp = await saveStamp({ rallyId, stampedAt: daysAgoAt(1, 12) });
      await attachPhotos(stamp.id, 3);
    });
    const detail = within(await screen.findByLabelText("Rally detail"));

    await userEvent
      .setup()
      .press(detail.getByRole("button", { name: "3 photos. Show photos" }));

    expect(await screen.findByText("1 / 3")).toBeOnTheScreen();
    expect(screen.getByText("🗼 Detail viewer")).toBeOnTheScreen();
  });
});

describe("S-037 T-002 ST-003 / T-003 ST-004 rally detail Album", () => {
  async function switchToAlbum() {
    const detail = within(await screen.findByLabelText("Rally detail"));
    await fireEvent(
      detail.getByTestId("rally-view-picker"),
      "selectionChange",
      {
        nativeEvent: { selection: "album" },
      },
    );
    return detail;
  }

  test("starts on Stamps with the counts of stamps and photos", async () => {
    await openRallyDetail("Detail counts", async (rallyId) => {
      const stamp = await saveStamp({ rallyId, stampedAt: daysAgoAt(1, 12) });
      await attachPhotos(stamp.id, 3);
    });

    const detail = within(await screen.findByLabelText("Rally detail"));
    expect(detail.getByTestId("rally-view-picker")).toHaveProp(
      "selection",
      "stamps",
    );
    expect(pickerSegments(detail)).toEqual(["Stamps · 2", "Album · 3"]);
    expect(
      detail.getByRole("button", { name: "3 photos. Show photos" }),
    ).toBeOnTheScreen();
  });

  test("Album makes one tile per day of this rally, newest first, without the emoji", async () => {
    let olderStampedAt = "";
    let newerStampedAt = "";
    await openRallyDetail("Detail album", async (rallyId) => {
      const older = await saveStamp({ rallyId, stampedAt: daysAgoAt(2, 12) });
      await attachPhotos(older.id, 2);
      const newer = await saveStamp({ rallyId, stampedAt: daysAgoAt(1, 12) });
      await attachPhotos(newer.id, 1);
      olderStampedAt = older.stampedAt;
      newerStampedAt = newer.stampedAt;
      await ralliesDb.saveRally({ name: "Other rally", emoji: "☕" });
      const other = (await ralliesDb.listRallies()).find(
        ({ name }) => name === "Other rally",
      );
      if (!other) throw new Error("Other rally not found");
      const otherStamp = await saveStamp({ rallyId: other.id });
      await attachPhotos(otherStamp.id, 1);
    });

    const detail = await switchToAlbum();

    const album = within(detail.getByTestId("rally-view-pager-album"));
    expect(
      album.queryByRole("button", { name: /photos?\. Show photos$/ }),
    ).not.toBeOnTheScreen();
    const tiles = album.getAllByRole("button", {
      name: /^Open (\d+ )?photos?, /,
    });
    expect(tiles).toHaveLength(2);
    expect(tiles[0]).toHaveAccessibleName(
      `Open photo, Detail album, ${formatSpokenDate(new Date(newerStampedAt))}`,
    );
    expect(tiles[1]).toHaveAccessibleName(
      `Open 2 photos, Detail album, ${formatSpokenDate(new Date(olderStampedAt))}`,
    );
    const hidden = { includeHiddenElements: true };
    expect(within(tiles[1]).getByText("2", hidden)).toBeOnTheScreen();
    expect(within(tiles[0]).queryByText("🗼", hidden)).not.toBeOnTheScreen();
    expect(pickerSegments(detail)).toEqual(["Stamps · 3", "Album · 3"]);
  });

  test("pressing a tile opens its photos from the first one", async () => {
    await openRallyDetail("Detail album open", async (rallyId) => {
      const stamp = await saveStamp({ rallyId, stampedAt: daysAgoAt(1, 12) });
      await attachPhotos(stamp.id, 2);
    });
    const detail = await switchToAlbum();

    await userEvent
      .setup()
      .press(detail.getByRole("button", { name: /^Open 2 photos, / }));

    expect(await screen.findByText("1 / 2")).toBeOnTheScreen();
  });

  test("shows No photos yet when the rally has no photos", async () => {
    await openRallyDetail("Detail no photos");

    const detail = await switchToAlbum();

    const album = within(detail.getByTestId("rally-view-pager-album"));
    expect(album.getByText("No photos yet")).toBeOnTheScreen();
    expect(album.queryByText("no memo")).not.toBeOnTheScreen();
  });
});

describe("S-043 T-001 ST-003 rally detail pages for Stamps and Album", () => {
  async function openWithPhotos(name: string) {
    await openRallyDetail(name, async (rallyId) => {
      const stamp = await saveStamp({ rallyId, stampedAt: daysAgoAt(1, 12) });
      await attachPhotos(stamp.id, 2);
    });
    const detail = within(await screen.findByLabelText("Rally detail"));
    expect(
      await detail.findByRole("button", { name: "2 photos. Show photos" }),
    ).toBeOnTheScreen();
    return detail;
  }

  test("keeps the top, the calendar and the switch above two pages, Stamps then Album", async () => {
    const detail = await openWithPhotos("Pager detail");

    const pager = within(detail.getByTestId("rally-view-pager"));
    expect(pager.queryByTestId("rally-top-panel")).not.toBeOnTheScreen();
    expect(pager.queryByTestId("rally-view-picker")).not.toBeOnTheScreen();
    const stampsPage = within(pager.getByTestId("rally-view-pager-stamps"));
    const albumPage = within(pager.getByTestId("rally-view-pager-album"));
    expect(
      stampsPage.getByRole("button", { name: "2 photos. Show photos" }),
    ).toBeOnTheScreen();
    expect(
      albumPage.getByRole("button", { name: /^Open 2 photos, Pager detail, / }),
    ).toBeOnTheScreen();
  });

  test("S-037 T-006 rounds only the outer corners of the album grid", async () => {
    const detail = await openWithPhotos("Album corners");
    const albumPage = within(detail.getByTestId("rally-view-pager-album"));

    // The grid is one surface: only its outer corners are rounded.
    const grid = albumPage.getByTestId("album-grid");
    expect(grid).toHaveProp(
      "className",
      expect.stringMatching(
        /(?=.*\brounded-2xl\b)(?=.*\boverflow-hidden\b)(?=.*\bborder-continuous\b)/,
      ),
    );
    for (const tile of within(grid).getAllByRole("button", {
      name: /^Open /,
    })) {
      expect(tile.props.className).not.toMatch(/rounded/);
    }
  });

  test("S-043 T-003 scrolls the top away with the pages and keeps the switch stuck", async () => {
    await openWithPhotos("Profile scroll");

    // One vertical scroll holds the top, the switch and the pages, and its
    // second child (the switch) sticks to the top.
    const scroll = screen.getByLabelText("Rally detail");
    expect(scroll.type).toBe("RCTScrollView");
    expect(scroll).toHaveProp("stickyHeaderIndices", [1]);
    const inScroll = within(scroll);
    expect(inScroll.getByTestId("rally-top-panel")).toBeOnTheScreen();
    expect(inScroll.getByTestId("rally-view-picker")).toBeOnTheScreen();
    expect(inScroll.getByTestId("rally-view-pager")).toBeOnTheScreen();
  });

  test("S-043 T-003 shows the pages before they are measured, then takes the shown page's height", async () => {
    await openWithPhotos("Profile height");
    const pager = screen.getByTestId("rally-view-pager");

    // Until a page reports its height, the pager is a screen tall rather
    // than zero, so the pages show and can be measured.
    expect(pager).toHaveStyle({ height: 1334 });

    await fireEvent(screen.getByTestId("rally-view-page-stamps"), "layout", {
      nativeEvent: { layout: { x: 0, y: 0, width: 750, height: 420 } },
    });
    expect(pager).toHaveStyle({ height: 420 });
  });

  test("turning the page changes the switch", async () => {
    const detail = await openWithPhotos("Pager turn");
    const pager = detail.getByTestId("rally-view-pager");

    await fireEvent(pager, "pageSelected", { nativeEvent: { position: 1 } });
    expect(detail.getByTestId("rally-view-picker")).toHaveProp(
      "selection",
      "album",
    );

    await fireEvent(pager, "pageSelected", { nativeEvent: { position: 0 } });
    expect(detail.getByTestId("rally-view-picker")).toHaveProp(
      "selection",
      "stamps",
    );
  });

  test("choosing on the switch turns the page", async () => {
    // The page turn itself is native; check that it is asked for.
    const setPage = jest.spyOn(PagerViewCommands, "setPage");
    const detail = await openWithPhotos("Pager switch");

    await fireEvent(
      detail.getByTestId("rally-view-picker"),
      "selectionChange",
      {
        nativeEvent: { selection: "album" },
      },
    );
    expect(setPage).toHaveBeenLastCalledWith(expect.anything(), 1);
  });

  test("has no pages without stamps", async () => {
    await openRallyDetail("Pager empty", async (rallyId) => {
      const [stamp] = await stampsDb.listRallyStamps(rallyId);
      await stampsDb.deleteStamp(stamp.id);
    });
    const detail = within(await screen.findByLabelText("Rally detail"));

    expect(await detail.findByText("No stamps yet")).toBeOnTheScreen();
    expect(detail.queryByTestId("rally-view-pager")).not.toBeOnTheScreen();
  });
});

describe("S-055 T-001 ST-002 rally detail month heading above the calendar", () => {
  test("puts the month and ‹ › outside the calendar's panel, like Logs", async () => {
    jest.setSystemTime(new Date(2026, 9, 20, 12));
    await openRallyDetail("Heading above");

    const calendar = await findRallyCalendar();
    const panel = within(screen.getByTestId("rally-calendar-panel"));
    expect(
      calendar.getByRole("button", { name: "Choose month, October 2026" }),
    ).toBeOnTheScreen();
    expect(panel.queryByText("October 2026")).not.toBeOnTheScreen();
    expect(
      panel.queryByRole("button", { name: "Previous month" }),
    ).not.toBeOnTheScreen();
    expect(panel.getByText("Mon")).toBeOnTheScreen();
  });
});
