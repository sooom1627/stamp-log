import { Alert, StyleSheet, type AlertButton } from "react-native";

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

import * as ralliesDb from "@/features/rallies/db/rallies-db";
import { listRallies, saveRally } from "@/features/rallies/db/rallies-db";
import { stampPhotoThumbUri } from "@/features/rallies/db/stamp-photo-files";
import * as stampsDb from "@/features/rallies/db/stamps-db";
import {
  listStamps,
  saveStamp,
  updateStampMemo,
} from "@/features/rallies/db/stamps-db";
import {
  formatStampDate,
  formatStampDay,
  formatStampTime,
} from "@/shared/utils/format-stamp-date-time";
import { localDateKey } from "@/shared/utils/local-date-key";

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
    file.write("jpeg with exif");
    return file.uri;
  });
  await updateStampMemo({ id: stampId, memo: "", photoUris });
}

afterEach(() => {
  jest.restoreAllMocks();
});

function daysAgoAt(days: number, hours: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
}

async function saveRallyNamed(name: string, emoji: string) {
  await saveRally({ name, emoji });
  const rally = (await listRallies()).find(
    (candidate) => candidate.name === name,
  );
  if (!rally) throw new Error(`Rally ${name} not found`);
  return rally;
}

// The switch's segments are @expo/ui SwiftUI Text, which is not host text in
// Jest, so getByText cannot see them; read each native view's text prop.
function pickerSegments(logs: ReturnType<typeof within>) {
  const texts: string[] = [];
  const collect = (element: ReturnType<typeof screen.getByTestId> | string) => {
    if (typeof element === "string") return;
    if (typeof element.props.text === "string") texts.push(element.props.text);
    element.children.forEach(collect);
  };
  collect(logs.getByTestId("logs-view-picker"));
  return texts;
}

// The database is shared by every test; show only this test's stamps.
async function showOnlyStamps(ids: number[]) {
  const stamps = await listStamps();
  jest
    .spyOn(stampsDb, "listStamps")
    .mockResolvedValue(stamps.filter(({ id }) => ids.includes(id)));
}

async function openLogs() {
  await renderRouter("./src/app");
  expect(
    await screen.findByRole("link", { name: "Create rally" }),
  ).toBeOnTheScreen();
  await act(() => {
    router.push("/records");
  });
}

const stampTimePattern = / (AM|PM)$/;

describe("S-010 T-001 ST-003 Logs timeline", () => {
  test("shows stamps from every rally newest first with the rally name", async () => {
    const lab = await saveRallyNamed("Researchers", "🔬");
    const run = await saveRallyNamed("Weekend runs", "🏃");
    const newest = daysAgoAt(1, 19);
    const middle = daysAgoAt(2, 7);
    const oldest = daysAgoAt(3, 12);
    const withMemo = await saveStamp({ rallyId: lab.id, stampedAt: newest });
    await updateStampMemo({ id: withMemo.id, memo: "Talked at the lab" });
    await saveStamp({ rallyId: run.id, stampedAt: middle });
    await saveStamp({ rallyId: lab.id, stampedAt: oldest });

    await openLogs();

    // Home stays mounted behind the tab, so look inside the Logs list only.
    const logs = within(await screen.findByLabelText("Logs timeline"));
    const times = logs.getAllByText(stampTimePattern);
    expect(times).toHaveLength(3);
    [newest, middle, oldest].forEach((stampedAt, index) => {
      expect(times[index]).toHaveTextContent(
        formatStampTime(new Date(stampedAt)),
      );
    });
    expect(
      logs
        .getAllByText(/^(Researchers|Weekend runs)$/)
        .map((name) => name.props.children),
    ).toEqual(["Researchers", "Weekend runs", "Researchers"]);
    // The emoji icon is decorative (aria-hidden); the rally name is read out.
    // Read it per post, since the calendar shows emojis too.
    const hidden = { includeHiddenElements: true };
    expect(
      logs
        .getAllByTestId(/^stamp-post-/)
        .map((post) => within(post).getByText(/🔬|🏃/, hidden).props.children),
    ).toEqual(["🔬", "🏃", "🔬"]);
    expect(logs.getByText("Talked at the lab")).toBeOnTheScreen();
    expect(logs.getAllByText("no memo")).toHaveLength(2);
    // S-037: the Stamps heading became the Stamps / Album switch.
    expect(logs.getByTestId("logs-view-picker")).toHaveProp(
      "selection",
      "stamps",
    );
    expect(pickerSegments(logs)).toEqual(["Stamps · 3", "Album · 0"]);
  });
});

describe("S-011 RT-001 ST-003 Logs post shape", () => {
  test("titles each post with the rally name in bold and the time beside it, without the day", async () => {
    const lab = await saveRallyNamed("Post shape", "🔬");
    const stampedAt = daysAgoAt(2, 19);
    const stamp = await saveStamp({ rallyId: lab.id, stampedAt });

    await openLogs();

    const logs = within(await screen.findByLabelText("Logs timeline"));
    const post = within(logs.getByTestId(`stamp-post-${stamp.id}`));
    expect(post.getByText("Post shape")).toHaveProp(
      "className",
      expect.stringContaining("font-semibold"),
    );
    expect(post.getByText(formatStampTime(new Date(stampedAt)))).toHaveProp(
      "className",
      expect.stringContaining("text-foreground-muted"),
    );
    expect(
      post.queryByText(formatStampDay(new Date(stampedAt))),
    ).not.toBeOnTheScreen();
  });
});

describe("S-011 RT-001 ST-007 Logs day cards", () => {
  test("puts each day's posts on one card under its heading, newest day first", async () => {
    jest.setSystemTime(new Date(2026, 9, 10, 21));
    const rally = await saveRallyNamed("Day sections", "📚");
    const at = (day: number, hour: number) =>
      new Date(2026, 9, day, hour).toISOString();
    jest.spyOn(stampsDb, "listStamps").mockResolvedValue([
      {
        id: 904,
        rallyId: rally.id,
        stampedAt: at(10, 20),
        memo: null,
        photos: [],
      },
      {
        id: 903,
        rallyId: rally.id,
        stampedAt: at(10, 8),
        memo: null,
        photos: [],
      },
      {
        id: 902,
        rallyId: rally.id,
        stampedAt: at(9, 19),
        memo: null,
        photos: [],
      },
      {
        id: 901,
        rallyId: rally.id,
        stampedAt: at(8, 6),
        memo: null,
        photos: [],
      },
    ]);

    await openLogs();

    const list = await screen.findByLabelText("Logs timeline");
    // Headings scroll with their cards instead of sticking over the posts:
    // only the Stamps / Album switch (the second child) sticks (S-043 T-004).
    expect(list.props.stickyHeaderIndices).toEqual([1]);
    const logs = within(list);
    const todayCard = within(logs.getByTestId("day-card-2026-10-10"));
    expect(todayCard.getByTestId("stamp-post-904")).toBeOnTheScreen();
    expect(todayCard.getByTestId("stamp-post-903")).toBeOnTheScreen();
    expect(todayCard.queryByTestId("stamp-post-902")).not.toBeOnTheScreen();
    expect(
      within(logs.getByTestId("day-card-2026-10-08")).getByTestId(
        "stamp-post-901",
      ),
    ).toBeOnTheScreen();
    expect(
      logs
        .getAllByRole("heading")
        .map((heading) => heading.props.children)
        .filter((title) => title !== "Stamps"),
    ).toEqual(["Today", "Yesterday", "Thu, Oct 8"]);
    expect(logs.getByText("Sat, Oct 10")).toBeOnTheScreen();
    expect(logs.getByText("Fri, Oct 9")).toBeOnTheScreen();
    expect(
      within(logs.getByTestId("day-section-2026-10-10")).getByRole("heading"),
    ).toHaveTextContent("Today");
    expect(
      logs.getAllByText(stampTimePattern).map((time) => time.props.children),
    ).toEqual(["8:00 PM", "8:00 AM", "7:00 PM", "6:00 AM"]);
  });
});

describe("S-010 T-001 ST-004 Logs empty, loading and error", () => {
  const logsTimeline = async () =>
    within(await screen.findByLabelText("Logs timeline"));

  test("shows No stamps yet without the Stamps / Album switch when there are no stamps", async () => {
    jest.spyOn(stampsDb, "listStamps").mockResolvedValue([]);
    await openLogs();
    const logs = await logsTimeline();

    expect(await logs.findByText("No stamps yet")).toBeOnTheScreen();
    expect(logs.queryByTestId("logs-view-picker")).not.toBeOnTheScreen();
  });

  test("shows nothing while the stamps are loading", async () => {
    jest
      .spyOn(stampsDb, "listStamps")
      .mockImplementation(() => new Promise(() => {}));
    await openLogs();
    const logs = await logsTimeline();

    expect(logs.queryByText("No stamps yet")).not.toBeOnTheScreen();
    expect(logs.queryByText("Couldn't load")).not.toBeOnTheScreen();
  });

  test("shows a load error with Retry instead of the empty state", async () => {
    jest
      .spyOn(stampsDb, "listStamps")
      .mockRejectedValue(new Error("disk full"));
    await openLogs();
    const logs = await logsTimeline();

    expect(await logs.findByText("Couldn't load")).toBeOnTheScreen();
    expect(logs.getByRole("button", { name: "Retry" })).toBeOnTheScreen();
    expect(logs.queryByText("No stamps yet")).not.toBeOnTheScreen();
  });

  test("shows a load error when the rallies cannot be read", async () => {
    jest
      .spyOn(ralliesDb, "listRallies")
      .mockRejectedValue(new Error("disk full"));
    await renderRouter("./src/app");
    await act(() => {
      router.push("/records");
    });
    const logs = await logsTimeline();

    expect(await logs.findByText("Couldn't load")).toBeOnTheScreen();
    expect(logs.queryByText("No stamps yet")).not.toBeOnTheScreen();
  });

  test("shows the stamps after retrying a failed load", async () => {
    const rally = await saveRallyNamed("Retry rally", "🎯");
    await saveStamp({ rallyId: rally.id });
    const realListStamps = stampsDb.listStamps;
    const listSpy = jest
      .spyOn(stampsDb, "listStamps")
      .mockRejectedValue(new Error("disk full"));
    await openLogs();
    const logs = await logsTimeline();
    expect(await logs.findByText("Couldn't load")).toBeOnTheScreen();

    listSpy.mockImplementation(realListStamps);
    await userEvent.setup().press(logs.getByRole("button", { name: "Retry" }));

    expect(await logs.findByText("Retry rally")).toBeOnTheScreen();
    expect(logs.queryByText("Couldn't load")).not.toBeOnTheScreen();
  });
});

describe("S-010 T-001 ST-005 Logs edit and delete", () => {
  function findAlertButton(style: AlertButton["style"]): AlertButton {
    const buttons = jest.mocked(Alert.alert).mock.calls.at(-1)?.[2] ?? [];
    const button = buttons.find((candidate) => candidate.style === style);
    if (!button) throw new Error(`Alert button with style ${style} not found`);
    return button;
  }

  async function openLogsWithStamp(name: string) {
    const rally = await saveRallyNamed(name, "🧭");
    const stamp = await saveStamp({ rallyId: rally.id });
    await updateStampMemo({ id: stamp.id, memo: `${name} memo` });
    await openLogs();
    const logs = within(await screen.findByLabelText("Logs timeline"));
    expect(await logs.findByText(`${name} memo`)).toBeOnTheScreen();
    return { stamp, logs };
  }

  test("opens Edit stamp from the post menu", async () => {
    const { stamp, logs } = await openLogsWithStamp("Edit from Logs");

    await fireEvent(logs.getByTestId(`stamp-edit-${stamp.id}`), "buttonPress");

    expect(await screen.findByTestId("edit-stamp-form")).toBeOnTheScreen();
    expect(screen.getByDisplayValue("Edit from Logs memo")).toBeOnTheScreen();
  });

  test("deletes the stamp after confirmation and removes the post", async () => {
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const { stamp, logs } = await openLogsWithStamp("Delete from Logs");

    await fireEvent(
      logs.getByTestId(`stamp-delete-${stamp.id}`),
      "buttonPress",
    );
    expect(Alert.alert).toHaveBeenCalledWith(
      "Delete stamp?",
      "This action cannot be undone.",
      expect.any(Array),
    );
    await act(async () => {
      findAlertButton("destructive").onPress?.();
    });

    await waitFor(() => {
      expect(logs.queryByText("Delete from Logs memo")).not.toBeOnTheScreen();
    });
    expect(
      (await listStamps()).some((candidate) => candidate.id === stamp.id),
    ).toBe(false);
  });

  test("keeps the stamp when the deletion is cancelled", async () => {
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const { stamp, logs } = await openLogsWithStamp("Cancel from Logs");

    await fireEvent(
      logs.getByTestId(`stamp-delete-${stamp.id}`),
      "buttonPress",
    );
    await act(async () => {
      findAlertButton("cancel").onPress?.();
    });

    expect(logs.getByText("Cancel from Logs memo")).toBeOnTheScreen();
    expect(
      (await listStamps()).some((candidate) => candidate.id === stamp.id),
    ).toBe(true);
  });
});

describe("S-010 T-001 ST-006 Logs post opens its rally", () => {
  // Rally detail opens on the Logs stack, so the header's back returns to
  // Logs instead of switching to Home.
  test("opens the rally detail of the pressed post on the Logs tab", async () => {
    const rally = await saveRallyNamed("Open from Logs", "🚪");
    const stamp = await saveStamp({ rallyId: rally.id });
    const app = renderRouter("./src/app");
    await app;
    await act(() => {
      router.push("/records");
    });
    const logs = within(await screen.findByLabelText("Logs timeline"));

    await userEvent.setup().press(logs.getByTestId(`stamp-post-${stamp.id}`));

    expect(app.getPathname()).toBe(`/records/rallies/${rally.id}`);
    expect(app.getSegments()).toEqual(["(tabs)", "records", "rallies", "[id]"]);
    expect(await screen.findByLabelText("Rally detail")).toBeOnTheScreen();

    await act(() => {
      router.back();
    });
    expect(app.getPathname()).toBe("/records");
    expect(screen.getByLabelText("Logs timeline")).toBeOnTheScreen();
  });

  test("opens Edit stamp, not the rally, from the post menu", async () => {
    const rally = await saveRallyNamed("Menu stays in Logs", "🧷");
    const stamp = await saveStamp({ rallyId: rally.id });
    const app = renderRouter("./src/app");
    await app;
    await act(() => {
      router.push("/records");
    });
    const logs = within(await screen.findByLabelText("Logs timeline"));

    await fireEvent(logs.getByTestId(`stamp-edit-${stamp.id}`), "buttonPress");

    expect(await screen.findByTestId("edit-stamp-form")).toBeOnTheScreen();
    expect(app.getPathname()).toBe("/edit-stamp");
  });
});

describe("S-011 T-001 ST-003 Logs calendar", () => {
  async function openLogsCalendar() {
    await openLogs();
    const logs = within(await screen.findByLabelText("Logs timeline"));
    return { logs, calendar: within(logs.getByTestId("logs-calendar")) };
  }

  test("opens on this week and marks stamped days with the last rally's emoji and +N", async () => {
    const cafes = await saveRallyNamed("Calendar cafes", "🧋");
    const runs = await saveRallyNamed("Calendar runs", "🛼");
    // Stamped now, so today (always in the week shown first) ends on cafes.
    await saveStamp({ rallyId: runs.id });
    await saveStamp({ rallyId: cafes.id });

    const { calendar } = await openLogsCalendar();

    const todayKey = localDateKey(new Date());
    const today = calendar.getByTestId(`calendar-day-${todayKey}`);
    const hidden = { includeHiddenElements: true };
    expect(within(today).getByText("🧋")).toBeOnTheScreen();
    expect(within(today).getByText(/^\+\d+$/, hidden)).toBeOnTheScreen();
    expect(
      calendar.getAllByRole("button", { name: /, 20\d\d, / }),
    ).toHaveLength(7);
    expect(
      calendar.getByRole("button", { name: "Show month" }),
    ).toBeOnTheScreen();
  });

  test("does not change the list when the calendar moves", async () => {
    const rally = await saveRallyNamed("Calendar list", "🪁");
    await saveStamp({ rallyId: rally.id });
    const { logs, calendar } = await openLogsCalendar();
    const firstPost = () => logs.getAllByText(stampTimePattern)[0];
    const before = firstPost().props.children;
    const user = userEvent.setup();

    await user.press(calendar.getByRole("button", { name: "Previous week" }));
    await user.press(calendar.getByRole("button", { name: "Show month" }));
    await user.press(calendar.getByRole("button", { name: "Previous month" }));

    expect(firstPost().props.children).toEqual(before);
    expect(logs.getByText("Calendar list")).toBeOnTheScreen();
  });

  test("S-012 T-001 ST-003 opens the Logs day sheet from a recorded day only", async () => {
    const rally = await saveRallyNamed("Calendar press", "🪀");
    const stamp = await saveStamp({ rallyId: rally.id });
    // Only today is recorded, so every other day of the week has no stamp.
    jest.spyOn(stampsDb, "listStamps").mockResolvedValue([stamp]);
    const { calendar } = await openLogsCalendar();
    const todayKey = localDateKey(new Date());

    const days = calendar.getAllByRole("button", { name: /, 20\d\d, / });
    for (const day of days) {
      if (within(day).queryByTestId(`calendar-day-${todayKey}`)) {
        expect(day).toBeEnabled();
        continue;
      }
      expect(day).toBeDisabled();
    }

    await userEvent
      .setup()
      .press(
        within(calendar.getByTestId(`calendar-day-${todayKey}`)).getByText(
          "🪀",
        ),
      );

    const sheet = within(await screen.findByTestId("logs-day-sheet"));
    expect(
      sheet.getByRole("heading", {
        name: new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
          new Date(),
        ),
      }),
    ).toBeOnTheScreen();
    expect(await sheet.findByText("Calendar press")).toBeOnTheScreen();
  });
});

describe("S-018 T-001 ST-001 bottom tabs", () => {
  test("switches between the home and logs tabs", async () => {
    const app = renderRouter("./src/app");
    await app;

    expect(
      await screen.findByRole("link", { name: "Create rally" }),
    ).toBeOnTheScreen();
    expect(app.getPathname()).toBe("/");

    await act(() => {
      router.push("/records");
    });
    expect(app.getPathname()).toBe("/records");
    expect(screen.getByLabelText("Logs timeline")).toBeOnTheScreen();

    await act(() => {
      router.push("/");
    });
    expect(app.getPathname()).toBe("/");
    expect(
      screen.getByRole("link", { name: "Create rally" }),
    ).toBeOnTheScreen();
  });

  // S-010 ST-007: the calendar lives on Logs, so there is no Calendar tab.
  test("has only the Home and Logs tabs", async () => {
    await renderRouter("./src/app");
    await screen.findByRole("link", { name: "Create rally" });

    const tabs = screen.container
      .queryAll((instance) => instance.type === "RNSTabsScreenIOS")
      .map((instance) => instance.props.title);
    expect(tabs).toEqual(["Home", "Logs"]);
  });
});

describe("S-039 T-002 ST-005 archived rallies in Logs", () => {
  test("keeps the stamps of an archived rally in the Logs timeline", async () => {
    const archived = await saveRallyNamed("Archived trips", "🧳");
    await saveStamp({ rallyId: archived.id, stampedAt: daysAgoAt(1, 10) });
    await ralliesDb.setRallyArchived({ id: archived.id, isArchived: true });

    await openLogs();

    const logs = within(await screen.findByLabelText("Logs timeline"));
    expect(await logs.findByText("Archived trips")).toBeOnTheScreen();
  });
});

describe("S-035 ST-006 photo mark on Logs posts", () => {
  test("shows the photo mark and count beside the rally name and time", async () => {
    const lab = await saveRallyNamed("Logs photos", "📷");
    const withPhoto = await saveStamp({
      rallyId: lab.id,
      stampedAt: daysAgoAt(1, 19),
    });
    await attachPhotos(withPhoto.id, 1);
    const withoutPhoto = await saveStamp({
      rallyId: lab.id,
      stampedAt: daysAgoAt(2, 19),
    });

    await openLogs();

    const logs = within(await screen.findByLabelText("Logs timeline"));
    const marked = within(logs.getByTestId(`stamp-post-${withPhoto.id}`));
    expect(marked.getByLabelText("1 photo. Show photos")).toHaveTextContent(
      "1",
    );
    const plain = within(logs.getByTestId(`stamp-post-${withoutPhoto.id}`));
    expect(plain.queryByLabelText(/Show photos$/)).not.toBeOnTheScreen();
  });
});

describe("S-037 T-001 ST-003 the photo mark opens the photos", () => {
  // Pressing the rest of the post still opens the rally (S-010 T-001 ST-006).
  test("opens the stamp's photos full screen instead of the rally", async () => {
    const rally = await saveRallyNamed("Logs viewer", "🎞️");
    const stamp = await saveStamp({
      rallyId: rally.id,
      stampedAt: daysAgoAt(1, 19),
    });
    await attachPhotos(stamp.id, 2);
    const app = renderRouter("./src/app");
    await app;
    await act(() => {
      router.push("/records");
    });
    const logs = within(await screen.findByLabelText("Logs timeline"));

    await userEvent
      .setup()
      .press(logs.getByRole("button", { name: "2 photos. Show photos" }));

    expect(app.getPathname()).toBe("/stamp-photos");
    expect(await screen.findByText("1 / 2")).toBeOnTheScreen();
    expect(screen.getByText("🎞️ Logs viewer")).toBeOnTheScreen();
  });
});

describe("S-037 T-002 ST-002 / T-003 ST-004 Logs Album", () => {
  async function switchToAlbum() {
    const logs = within(await screen.findByLabelText("Logs timeline"));
    await fireEvent(logs.getByTestId("logs-view-picker"), "selectionChange", {
      nativeEvent: { selection: "album" },
    });
    return logs;
  }

  test("starts on Stamps with the counts of stamps and photos", async () => {
    const lab = await saveRallyNamed("Album counts", "🔬");
    const stamp = await saveStamp({
      rallyId: lab.id,
      stampedAt: daysAgoAt(1, 19),
    });
    await attachPhotos(stamp.id, 2);
    const other = await saveStamp({
      rallyId: lab.id,
      stampedAt: daysAgoAt(2, 19),
    });
    await showOnlyStamps([stamp.id, other.id]);

    await openLogs();

    const logs = within(await screen.findByLabelText("Logs timeline"));
    expect(logs.getByTestId("logs-view-picker")).toHaveProp(
      "selection",
      "stamps",
    );
    expect(pickerSegments(logs)).toEqual(["Stamps · 2", "Album · 2"]);
    expect(logs.getByTestId(`stamp-post-${stamp.id}`)).toBeOnTheScreen();
  });

  test("Album makes one tile per day and rally, newest first, with the emoji and the count", async () => {
    const lab = await saveRallyNamed("Album lab", "🔬");
    const cafe = await saveRallyNamed("Album cafe", "☕");
    const labOlder = await saveStamp({
      rallyId: lab.id,
      stampedAt: daysAgoAt(3, 9),
    });
    await attachPhotos(labOlder.id, 1);
    const labDay = await saveStamp({
      rallyId: lab.id,
      stampedAt: daysAgoAt(1, 9),
    });
    await attachPhotos(labDay.id, 2);
    const cafeDay = await saveStamp({
      rallyId: cafe.id,
      stampedAt: daysAgoAt(1, 19),
    });
    await attachPhotos(cafeDay.id, 1);
    await showOnlyStamps([labOlder.id, labDay.id, cafeDay.id]);
    await openLogs();

    const logs = await switchToAlbum();

    const album = within(logs.getByTestId("logs-view-pager-album"));
    expect(
      album.queryByTestId(`stamp-post-${cafeDay.id}`),
    ).not.toBeOnTheScreen();
    const tiles = album.getAllByRole("button", {
      name: /^Open (\d+ )?photos?, /,
    });
    const day = (iso: string) => formatStampDate(new Date(iso));
    expect(tiles).toHaveLength(3);
    expect(tiles[0]).toHaveAccessibleName(
      `Open photo, Album cafe, ${day(cafeDay.stampedAt)}`,
    );
    expect(tiles[1]).toHaveAccessibleName(
      `Open 2 photos, Album lab, ${day(labDay.stampedAt)}`,
    );
    expect(tiles[2]).toHaveAccessibleName(
      `Open photo, Album lab, ${day(labOlder.stampedAt)}`,
    );
    const hidden = { includeHiddenElements: true };
    expect(within(tiles[0]).getByText("☕", hidden)).toBeOnTheScreen();
    expect(within(tiles[1]).getByText("🔬", hidden)).toBeOnTheScreen();
    // The count shows only on a tile with two photos or more.
    expect(within(tiles[1]).getByText("2", hidden)).toBeOnTheScreen();
    expect(within(tiles[0]).queryByText("1", hidden)).not.toBeOnTheScreen();
    expect(pickerSegments(logs)).toEqual(["Stamps · 3", "Album · 4"]);
  });

  test("pressing a tile opens its photos from the first one", async () => {
    const lab = await saveRallyNamed("Album open", "🔬");
    const stamp = await saveStamp({
      rallyId: lab.id,
      stampedAt: daysAgoAt(1, 19),
    });
    await attachPhotos(stamp.id, 2);
    await showOnlyStamps([stamp.id]);
    await openLogs();
    const logs = await switchToAlbum();

    await userEvent
      .setup()
      .press(
        logs.getByRole("button", { name: /^Open 2 photos, Album open, / }),
      );

    expect(await screen.findByText("1 / 2")).toBeOnTheScreen();
  });

  test("shows No photos yet when no stamp has photos", async () => {
    const lab = await saveRallyNamed("Album empty", "🔬");
    const stamp = await saveStamp({
      rallyId: lab.id,
      stampedAt: daysAgoAt(1, 19),
    });
    await showOnlyStamps([stamp.id]);
    await openLogs();

    const logs = await switchToAlbum();

    const album = within(logs.getByTestId("logs-view-pager-album"));
    expect(album.getByText("No photos yet")).toBeOnTheScreen();
    expect(album.queryByTestId(`stamp-post-${stamp.id}`)).not.toBeOnTheScreen();
  });
});

describe("S-043 T-001 ST-002 Logs pages for Stamps and Album", () => {
  async function openLogsWithPhotos() {
    const lab = await saveRallyNamed("Pager lab", "🔬");
    const stamp = await saveStamp({
      rallyId: lab.id,
      stampedAt: daysAgoAt(1, 19),
    });
    await attachPhotos(stamp.id, 1);
    await showOnlyStamps([stamp.id]);
    await openLogs();
    const logs = within(await screen.findByLabelText("Logs timeline"));
    expect(await logs.findByTestId(`stamp-post-${stamp.id}`)).toBeOnTheScreen();
    return { logs, stamp };
  }

  test("keeps the calendar and the switch above two pages, Stamps then Album", async () => {
    const { logs, stamp } = await openLogsWithPhotos();

    const pager = within(logs.getByTestId("logs-view-pager"));
    expect(pager.queryByTestId("logs-calendar")).not.toBeOnTheScreen();
    expect(pager.queryByTestId("logs-view-picker")).not.toBeOnTheScreen();
    const stampsPage = within(pager.getByTestId("logs-view-pager-stamps"));
    const albumPage = within(pager.getByTestId("logs-view-pager-album"));
    expect(stampsPage.getByTestId(`stamp-post-${stamp.id}`)).toBeOnTheScreen();
    expect(
      albumPage.getByRole("button", { name: /^Open photo, Pager lab, / }),
    ).toBeOnTheScreen();
  });

  test("S-037 T-006 rounds only the outer corners of the album grid", async () => {
    const { logs } = await openLogsWithPhotos();
    const albumPage = within(logs.getByTestId("logs-view-pager-album"));

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

  test("S-043 T-004 scrolls the top away with the pages and keeps the switch stuck", async () => {
    await openLogsWithPhotos();

    // One vertical scroll holds the top, the switch and the pages, and its
    // second child (the switch) sticks to the top.
    const scroll = screen.getByLabelText("Logs timeline");
    expect(scroll.type).toBe("RCTScrollView");
    expect(scroll).toHaveProp("stickyHeaderIndices", [1]);
    const inScroll = within(scroll);
    expect(inScroll.getByTestId("logs-calendar")).toBeOnTheScreen();
    expect(inScroll.getByTestId("logs-view-picker")).toBeOnTheScreen();
    expect(inScroll.getByTestId("logs-view-pager")).toBeOnTheScreen();
  });

  test("S-043 T-004 lets the large title shrink and sticks the switch below the header", async () => {
    await openLogsWithPhotos();

    // The large title shrinks only when the scroll runs under the header, so
    // the scroll takes the header's inset itself (as Home does).
    const scroll = screen.getByLabelText("Logs timeline");
    expect(scroll).toHaveProp("contentInsetAdjustmentBehavior", "automatic");
    // A sticky header stops at the scroll's top edge, under the header, so
    // the stuck part reaches up by the header's height above the switch.
    const stuck = within(scroll).getByTestId("logs-view-switch");
    const { marginTop, paddingTop } = StyleSheet.flatten(stuck.props.style);
    expect(paddingTop).toBeGreaterThan(0);
    expect(marginTop).toBe(-paddingTop);
    expect(within(stuck).getByTestId("logs-view-picker")).toBeOnTheScreen();
  });

  test("S-043 T-004 shows the pages before they are measured, then takes the shown page's height", async () => {
    await openLogsWithPhotos();
    const pager = screen.getByTestId("logs-view-pager");

    // Until a page reports its height, the pager is a screen tall rather
    // than zero, so the pages show and can be measured.
    expect(pager).toHaveStyle({ height: 1334 });

    await fireEvent(screen.getByTestId("logs-view-page-stamps"), "layout", {
      nativeEvent: { layout: { x: 0, y: 0, width: 750, height: 420 } },
    });
    expect(pager).toHaveStyle({ height: 420 });
  });

  test("turning the page changes the switch", async () => {
    const { logs } = await openLogsWithPhotos();
    const pager = logs.getByTestId("logs-view-pager");

    await fireEvent(pager, "pageSelected", { nativeEvent: { position: 1 } });
    expect(logs.getByTestId("logs-view-picker")).toHaveProp(
      "selection",
      "album",
    );

    await fireEvent(pager, "pageSelected", { nativeEvent: { position: 0 } });
    expect(logs.getByTestId("logs-view-picker")).toHaveProp(
      "selection",
      "stamps",
    );
  });

  test("choosing on the switch turns the page", async () => {
    // The page turn itself is native; check that it is asked for.
    const setPage = jest.spyOn(PagerViewCommands, "setPage");
    const { logs } = await openLogsWithPhotos();

    await fireEvent(logs.getByTestId("logs-view-picker"), "selectionChange", {
      nativeEvent: { selection: "album" },
    });
    expect(setPage).toHaveBeenLastCalledWith(expect.anything(), 1);

    await fireEvent(logs.getByTestId("logs-view-picker"), "selectionChange", {
      nativeEvent: { selection: "stamps" },
    });
    expect(setPage).toHaveBeenLastCalledWith(expect.anything(), 0);
  });

  test("has no pages without stamps", async () => {
    jest.spyOn(stampsDb, "listStamps").mockResolvedValue([]);
    await openLogs();
    const logs = within(await screen.findByLabelText("Logs timeline"));

    expect(await logs.findByText("No stamps yet")).toBeOnTheScreen();
    expect(logs.queryByTestId("logs-view-pager")).not.toBeOnTheScreen();
  });
});

describe("S-037 T-005 ST-003 small copies in the Album", () => {
  test("a tile shows the small copy of its first photo", async () => {
    const lab = await saveRallyNamed("Album thumbs", "🔬");
    const stamp = await saveStamp({
      rallyId: lab.id,
      stampedAt: daysAgoAt(1, 19),
    });
    await attachPhotos(stamp.id, 2);
    await showOnlyStamps([stamp.id]);
    const [cover] = (await listStamps()).find(
      ({ id }) => id === stamp.id,
    )!.photos;
    await openLogs();
    const logs = within(await screen.findByLabelText("Logs timeline"));
    await fireEvent(logs.getByTestId("logs-view-picker"), "selectionChange", {
      nativeEvent: { selection: "album" },
    });

    const tile = logs.getByRole("button", {
      name: /^Open 2 photos, Album thumbs, /,
    });

    expect(within(tile).getByTestId("album-tile-image")).toHaveProp("source", [
      { uri: stampPhotoThumbUri(cover.fileName) },
    ]);
  });
});
