import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, screen, userEvent, waitFor } from "@testing-library/react-native";

import * as ralliesDb from "@/shared/db/rallies-db";
import { saveStamp } from "@/shared/db/stamps-db";
import { deleteAllRallies } from "@/shared/utils/test-helpers/delete-all-rallies";

jest.useFakeTimers();

beforeEach(async () => {
  await deleteAllRallies();
});

async function saveRally(days: Date[]) {
  await ralliesDb.saveRally({ name: "行ったカフェ", emoji: "☕" });
  const [rally] = await ralliesDb.listRallies();
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

describe("S-058 T-004 ST-006 year entry on Logs", () => {
  test("in December, opens the year's review", async () => {
    jest.setSystemTime(new Date(2026, 11, 10, 12));
    await saveRally([new Date(2026, 2, 3, 9)]);
    const app = await openLogs();

    await userEvent
      .setup()
      .press(await screen.findByRole("link", { name: "Your 2026 with Ato" }));

    await waitFor(() => {
      expect(app.getPathname()).toBe("/year-review");
    });
    expect(app.getSearchParams()).toEqual({ year: "2026" });
  });

  test("in January, shows the year before", async () => {
    jest.setSystemTime(new Date(2027, 0, 31, 12));
    await saveRally([new Date(2026, 2, 3, 9)]);
    await openLogs();

    expect(
      await screen.findByRole("link", { name: "Your 2026 with Ato" }),
    ).toBeOnTheScreen();
  });

  test.each([
    ["in November", new Date(2026, 10, 30, 12), new Date(2026, 2, 3, 9)],
    // December, but the year has no stamps (only last year's).
    [
      "for a year without stamps",
      new Date(2026, 11, 10, 12),
      new Date(2025, 2, 3, 9),
    ],
  ])("does not show %s", async (_, today, stampedAt) => {
    jest.setSystemTime(today);
    await saveRally([stampedAt]);
    await openLogs();

    // The calendar's share row has loaded, so the entry would be there too.
    await act(async () => {
      await jest.runOnlyPendingTimersAsync();
    });
    expect(screen.queryByRole("link", { name: /with Ato/ })).toBeNull();
  });
});
