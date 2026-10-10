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

import * as ralliesDb from "@/features/rallies/db/rallies-db";
import { listRallies, saveRally } from "@/features/rallies/db/rallies-db";
import * as stampsDb from "@/features/rallies/db/stamps-db";
import {
  listStamps,
  saveStamp,
  updateStampMemo,
} from "@/features/rallies/db/stamps-db";
import {
  formatStampDay,
  formatStampTime,
} from "@/shared/utils/format-stamp-date-time";

jest.useFakeTimers();

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
  await saveRally({ name, type: "place", emoji });
  const rally = (await listRallies()).find(
    (candidate) => candidate.name === name,
  );
  if (!rally) throw new Error(`Rally ${name} not found`);
  return rally;
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
    expect(logs.getByText(formatStampDay(new Date(newest)))).toBeOnTheScreen();
    expect(
      logs
        .getAllByText(/^(Researchers|Weekend runs)$/)
        .map((name) => name.props.children),
    ).toEqual(["Researchers", "Weekend runs", "Researchers"]);
    // The emoji icon is decorative (aria-hidden); the rally name is read out.
    const hidden = { includeHiddenElements: true };
    expect(logs.getAllByText("🔬", hidden)).toHaveLength(2);
    expect(logs.getAllByText("🏃", hidden)).toHaveLength(1);
    expect(logs.getByText("Talked at the lab")).toBeOnTheScreen();
    expect(logs.getAllByText("no memo")).toHaveLength(2);
    expect(logs.getByRole("heading", { name: "Stamps" })).toBeOnTheScreen();
    expect(logs.getByLabelText("3 stamps in the timeline")).toHaveTextContent(
      "3",
    );
  });
});

describe("S-010 T-001 ST-004 Logs empty, loading and error", () => {
  const logsTimeline = async () =>
    within(await screen.findByLabelText("Logs timeline"));

  test("shows No stamps yet without the Stamps heading when there are no stamps", async () => {
    jest.spyOn(stampsDb, "listStamps").mockResolvedValue([]);
    await openLogs();
    const logs = await logsTimeline();

    expect(await logs.findByText("No stamps yet")).toBeOnTheScreen();
    expect(logs.queryByRole("heading", { name: "Stamps" })).toBeNull();
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
  test("opens the rally detail of the pressed post", async () => {
    const rally = await saveRallyNamed("Open from Logs", "🚪");
    const stamp = await saveStamp({ rallyId: rally.id });
    const app = renderRouter("./src/app");
    await app;
    await act(() => {
      router.push("/records");
    });
    const logs = within(await screen.findByLabelText("Logs timeline"));

    await userEvent.setup().press(logs.getByTestId(`stamp-post-${stamp.id}`));

    expect(app.getPathname()).toBe(`/rallies/${rally.id}`);
    expect(await screen.findByLabelText("Rally detail")).toBeOnTheScreen();
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
