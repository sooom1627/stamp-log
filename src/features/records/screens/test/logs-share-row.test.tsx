import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, screen, userEvent, within } from "@testing-library/react-native";

import * as ralliesDb from "@/shared/db/rallies-db";
import { saveStamp } from "@/shared/db/stamps-db";
import { deleteAllRallies } from "@/shared/utils/test-helpers/delete-all-rallies";
import { offScaleClassNames } from "@/shared/utils/test-helpers/design-rules";

jest.useFakeTimers();

beforeEach(async () => {
  jest.setSystemTime(new Date(2026, 9, 20, 12));
  await deleteAllRallies();
});

async function saveRally(name: string, days: Date[]) {
  await ralliesDb.saveRally({ name, emoji: "☕" });
  const rally = (await ralliesDb.listRallies()).find(
    (candidate) => candidate.name === name,
  );
  if (!rally) throw new Error(`Rally ${name} not found`);
  for (const day of days) {
    await saveStamp({ rallyId: rally.id, stampedAt: day.toISOString() });
  }
}

async function openLogs() {
  const app = await renderRouter("./src/app");
  await act(() => {
    router.push("/records");
  });
  await screen.findByLabelText("Logs timeline");
  return app;
}

function logsCalendar() {
  return within(screen.getByTestId("logs-calendar-panel"));
}

describe("S-058 T-003 ST-005 share row on Logs", () => {
  test("shows the shown month's stamps and rallies under the calendar days", async () => {
    await saveRally("行ったカフェ", [
      new Date(2026, 9, 2, 9),
      new Date(2026, 9, 9, 9),
    ]);
    await saveRally("読んだ本", [new Date(2026, 9, 5, 9)]);
    // Another month's stamp does not count.
    await saveRally("先月", [new Date(2026, 8, 5, 9)]);

    await openLogs();

    const row = within(
      await within(screen.getByTestId("logs-calendar-panel")).findByTestId(
        "share-row",
      ),
    );
    expect(row.getByText("3 stamps · 2 rallies")).toBeOnTheScreen();
    expect(offScaleClassNames(screen.getByTestId("share-row"))).toEqual([]);
  });

  test("Share opens the share sheet with the shown month", async () => {
    await saveRally("送る月", [new Date(2026, 9, 2, 9)]);
    const app = await openLogs();

    await userEvent
      .setup()
      .press(
        await logsCalendar().findByRole("button", { name: "Share image" }),
      );

    expect(await screen.findByTestId("share-month-sheet")).toBeOnTheScreen();
    expect(app.getPathname()).toBe("/share-month");
    expect(app.getSearchParams()).toEqual({ month: "2026-10" });
  });

  test("follows the calendar to another month, and is not shown for a month without stamps", async () => {
    await saveRally("九月", [new Date(2026, 8, 5, 9)]);
    await saveRally("十月", [new Date(2026, 9, 5, 9)]);
    await openLogs();
    expect(await logsCalendar().findByTestId("share-row")).toBeOnTheScreen();

    const user = userEvent.setup();
    await user.press(
      within(screen.getByTestId("logs-calendar")).getByRole("button", {
        name: "Previous month",
      }),
    );
    expect(
      within(screen.getByTestId("logs-calendar")).getByText("September 2026"),
    ).toBeOnTheScreen();
    expect(
      await logsCalendar().findByText("1 stamp · 1 rally"),
    ).toBeOnTheScreen();

    await user.press(
      within(screen.getByTestId("logs-calendar")).getByRole("button", {
        name: "Previous month",
      }),
    );
    expect(
      within(screen.getByTestId("logs-calendar")).getByText("August 2026"),
    ).toBeOnTheScreen();
    expect(logsCalendar().queryByTestId("share-row")).toBeNull();
  });
});
