import { Alert, type AlertButton } from "react-native";

import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import {
  act,
  fireEvent,
  screen,
  userEvent,
  waitFor,
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

  test("deletes the rally after confirmation and returns home", async () => {
    const { rally, user } = await openRallyDetail("Delete from detail");

    await user.press(
      await screen.findByRole("button", {
        name: "Delete Delete from detail",
      }),
    );
    expect(Alert.alert).toHaveBeenCalledTimes(1);

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

  test("shows the global error toast when deletion fails", async () => {
    jest
      .spyOn(ralliesDb, "deleteRally")
      .mockRejectedValueOnce(new Error("delete failed"));
    const { user } = await openRallyDetail("Delete fails");

    await user.press(
      await screen.findByRole("button", { name: "Delete Delete fails" }),
    );
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

describe("S-025 T-001 ST-006 past stamp entry", () => {
  test("opens the past stamp formSheet and returns with the new stamp counted", async () => {
    const { rally, user } = await openRallyDetail("Past stamp entry");
    expect(await screen.findByText("1 stamp")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Past stamp" }));

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
