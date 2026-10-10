import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, screen, within } from "@testing-library/react-native";

import { listRallies, saveRally } from "@/features/rallies/db/rallies-db";
import { saveStamp, updateStampMemo } from "@/features/rallies/db/stamps-db";
import {
  formatStampDay,
  formatStampTime,
} from "@/shared/utils/format-stamp-date-time";

jest.useFakeTimers();

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

describe("S-018 T-001 ST-001 bottom tabs", () => {
  test("switches between home, logs, and calendar tabs", async () => {
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
      router.push("/calendar");
    });
    expect(app.getPathname()).toBe("/calendar");
    expect(screen.getByRole("heading", { name: "Calendar" })).toBeOnTheScreen();

    await act(() => {
      router.push("/");
    });
    expect(app.getPathname()).toBe("/");
    expect(
      screen.getByRole("link", { name: "Create rally" }),
    ).toBeOnTheScreen();
  });
});
