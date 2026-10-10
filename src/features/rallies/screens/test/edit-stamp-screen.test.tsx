import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import {
  act,
  fireEvent,
  screen,
  userEvent,
  within,
} from "@testing-library/react-native";

import {
  formatStampDay,
  formatStampTime,
} from "@/shared/utils/format-stamp-date-time";

import { listRallies, saveRally } from "../../db/rallies-db";
import { listStamps, saveStamp, updateStampMemo } from "../../db/stamps-db";

jest.useFakeTimers();

// The rally detail timeline shows a post's day and time on separate lines.
// Logs also lists every stamp, so posts are read inside rally detail.
const rallyDetail = () => within(screen.getByLabelText("Rally detail"));

function expectPostAt(date: Date) {
  expect(rallyDetail().getByText(formatStampDay(date))).toBeOnTheScreen();
  expect(rallyDetail().getByText(formatStampTime(date))).toBeOnTheScreen();
}

const now = new Date(2026, 8, 20, 15, 0);

beforeEach(() => {
  jest.setSystemTime(now);
});

async function openEdit(
  name: string,
  seed: (rallyId: number) => Promise<number>,
) {
  await saveRally({ name, type: "person", emoji: "🧑‍🔬" });
  const rally = (await listRallies()).find(
    (candidate) => candidate.name === name,
  );
  if (!rally) throw new Error(`Rally ${name} not found`);
  const stampId = await seed(rally.id);

  await renderRouter("./src/app");
  expect(
    await screen.findByRole("button", { name: `View ${name} details` }),
  ).toBeOnTheScreen();
  await act(() => {
    router.push(`/rallies/${rally.id}`);
  });
  // Logs also lists every stamp, so press Edit inside rally detail.
  await fireEvent(
    within(await screen.findByLabelText("Rally detail")).getByTestId(
      `stamp-edit-${stampId}`,
    ),
    "buttonPress",
  );
  expect(await screen.findByTestId("edit-stamp-form")).toBeOnTheScreen();

  return { rally, stampId, user: userEvent.setup() };
}

async function pickDate(testID: string, date: Date) {
  await fireEvent(screen.getByTestId(testID), "dateChange", {
    nativeEvent: { date: date.toISOString() },
  });
}

async function findStamp(id: number) {
  return (await listStamps()).find((stamp) => stamp.id === id);
}

const localAt = (day: number, hours: number, minutes = 0) =>
  new Date(2026, 8, day, hours, minutes);

describe("S-006 T-001 ST-007 edit stamp from the timeline", () => {
  test("opens the sheet with the stamp's current memo", async () => {
    await openEdit("Edit sheet rally", async (rallyId) => {
      const stamp = await saveStamp({
        rallyId,
        stampedAt: localAt(18, 11, 40).toISOString(),
      });
      await updateStampMemo({ id: stamp.id, memo: "Talked in the lab" });
      return stamp.id;
    });

    expect(screen.getByTestId("edit-stamp-date")).toBeOnTheScreen();
    expect(screen.getByTestId("edit-stamp-time")).toBeOnTheScreen();
    expect(screen.getByDisplayValue("Talked in the lab")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  test("S-028 RT-002 ST-004 shows the rally above the Edit stamp heading", async () => {
    await openEdit("Edit heading rally", async (rallyId) => {
      const stamp = await saveStamp({
        rallyId,
        stampedAt: localAt(18, 11, 40).toISOString(),
      });
      return stamp.id;
    });

    const form = screen.getByTestId("edit-stamp-form");
    expect(
      within(form).getByRole("heading", { name: "Edit stamp" }),
    ).toBeOnTheScreen();
    expect(within(form).getByText("🧑‍🔬 Edit heading rally")).toBeOnTheScreen();
    expect(form).toHaveProp("className", expect.stringContaining("pt-8"));
  });

  test("saves the new date, time and memo and shows them on the timeline", async () => {
    const { stampId, user } = await openEdit(
      "Edit save rally",
      async (rallyId) => {
        const stamp = await saveStamp({
          rallyId,
          stampedAt: localAt(18, 11, 40).toISOString(),
        });
        await updateStampMemo({ id: stamp.id, memo: "Old memo" });
        return stamp.id;
      },
    );

    await pickDate("edit-stamp-date", localAt(12, 0));
    await pickDate("edit-stamp-time", localAt(20, 8, 15));
    const memoInput = screen.getByLabelText("Memo");
    await user.clear(memoInput);
    await user.type(memoInput, "New memo");
    await user.press(screen.getByRole("button", { name: "Save" }));

    expect(await rallyDetail().findByText("New memo")).toBeOnTheScreen();
    expect(screen.queryByTestId("edit-stamp-form")).not.toBeOnTheScreen();
    expect(screen.queryByText("Old memo")).not.toBeOnTheScreen();
    expectPostAt(localAt(12, 8, 15));
    expect(await findStamp(stampId)).toMatchObject({
      stampedAt: localAt(12, 8, 15).toISOString(),
      memo: "New memo",
    });
  });

  test("removes the memo when it is cleared", async () => {
    const { stampId, user } = await openEdit(
      "Edit clear rally",
      async (rallyId) => {
        const stamp = await saveStamp({
          rallyId,
          stampedAt: localAt(18, 11, 40).toISOString(),
        });
        await updateStampMemo({ id: stamp.id, memo: "Remove me" });
        return stamp.id;
      },
    );

    await user.clear(screen.getByLabelText("Memo"));
    await user.press(screen.getByRole("button", { name: "Save" }));

    await rallyDetail().findByText(formatStampTime(localAt(18, 11, 40)));
    expectPostAt(localAt(18, 11, 40));
    expect(screen.queryByText("Remove me")).not.toBeOnTheScreen();
    expect((await findStamp(stampId))?.memo).toBeNull();
  });

  test("cannot save a future date and time", async () => {
    const { stampId, user } = await openEdit(
      "Edit future rally",
      async (rallyId) =>
        (
          await saveStamp({
            rallyId,
            stampedAt: localAt(18, 11, 40).toISOString(),
          })
        ).id,
    );

    await pickDate("edit-stamp-date", now);
    await pickDate("edit-stamp-time", localAt(20, 18, 0));

    expect(screen.getByText("Future times can't be saved.")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    await user.press(screen.getByRole("button", { name: "Save" }));
    expect((await findStamp(stampId))?.stampedAt).toBe(
      localAt(18, 11, 40).toISOString(),
    );
  });

  test("cannot move onto another stamp's day but can change the time on its own day", async () => {
    const { stampId, user } = await openEdit(
      "Edit same day rally",
      async (rallyId) => {
        await saveStamp({
          rallyId,
          stampedAt: localAt(15, 9, 0).toISOString(),
        });
        return (
          await saveStamp({
            rallyId,
            stampedAt: localAt(18, 11, 40).toISOString(),
          })
        ).id;
      },
    );

    await pickDate("edit-stamp-date", localAt(15, 0));
    expect(
      screen.getByText("This rally already has a stamp on this day."),
    ).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();

    await pickDate("edit-stamp-date", localAt(18, 0));
    await pickDate("edit-stamp-time", localAt(20, 21, 5));
    expect(
      screen.queryByText("This rally already has a stamp on this day."),
    ).not.toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Save" }));

    await rallyDetail().findByText(formatStampTime(localAt(18, 21, 5)));
    expectPostAt(localAt(18, 21, 5));
    expect((await findStamp(stampId))?.stampedAt).toBe(
      localAt(18, 21, 5).toISOString(),
    );
  });
});

describe("S-006 T-001 ST-011 Save only after a change", () => {
  const openWithMemo = (name: string) =>
    openEdit(name, async (rallyId) => {
      const stamp = await saveStamp({
        rallyId,
        stampedAt: new Date(2026, 8, 18, 11, 40, 23).toISOString(),
      });
      await updateStampMemo({ id: stamp.id, memo: "Talked" });
      return stamp.id;
    });

  test("enables Save when the memo changes and disables it when reverted", async () => {
    const { user } = await openWithMemo("Memo change rally");
    const memoInput = screen.getByLabelText("Memo");
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();

    await user.type(memoInput, " more");
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();

    await user.clear(memoInput);
    await user.type(memoInput, "Talked");
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  test("ignores spaces around the memo", async () => {
    const { user } = await openWithMemo("Memo spaces rally");

    await user.type(screen.getByLabelText("Memo"), "  ");

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  test("enables Save when the time changes and disables it when reverted", async () => {
    await openWithMemo("Time change rally");

    await pickDate("edit-stamp-time", localAt(20, 9, 5));
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();

    await pickDate("edit-stamp-time", localAt(20, 11, 40));
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  test("enables Save when the date changes", async () => {
    await openWithMemo("Date change rally");

    await pickDate("edit-stamp-date", localAt(12, 0));

    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });
});
