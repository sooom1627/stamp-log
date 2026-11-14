import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import {
  act,
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";

import * as ralliesDb from "@/shared/db/rallies-db";
import { saveStamp } from "@/shared/db/stamps-db";
import { deleteAllRallies } from "@/shared/utils/test-helpers/delete-all-rallies";

jest.useFakeTimers();

beforeEach(async () => {
  jest.setSystemTime(new Date(2026, 10, 13, 12));
  await deleteAllRallies();
});

async function saveRally(days: Date[]) {
  await ralliesDb.saveRally({ name: "行ったカフェ", emoji: "☕" });
  const [rally] = await ralliesDb.listRallies();
  for (const day of days) {
    await saveStamp({ rallyId: rally.id, stampedAt: day.toISOString() });
  }
}

async function openSettings() {
  const app = await renderRouter("./src/app");
  await act(() => {
    router.push("/settings");
  });
  await screen.findByRole("heading", { name: "Settings" });
  return app;
}

async function openLookBack() {
  const app = await renderRouter("./src/app");
  await act(() => {
    router.push("/look-back");
  });
  expect(await screen.findByTestId("look-back-sheet")).toBeOnTheScreen();
  return app;
}

describe("S-058 T-004 ST-007 look back", () => {
  test("Settings' Look back opens the look-back sheet", async () => {
    await saveRally([new Date(2026, 9, 3, 9)]);
    const app = await openSettings();

    await userEvent
      .setup()
      .press(await screen.findByRole("button", { name: "Look back" }));

    await waitFor(() => {
      expect(app.getPathname()).toBe("/look-back");
    });
  });

  test("without stamps, Settings has no Look back", async () => {
    await openSettings();

    await act(async () => {
      await jest.runOnlyPendingTimersAsync();
    });
    expect(screen.queryByRole("button", { name: "Look back" })).toBeNull();
  });

  test("lists each year's review and its months with stamps, newest first", async () => {
    await saveRally([
      new Date(2025, 11, 20, 9),
      new Date(2026, 9, 3, 9),
      new Date(2026, 9, 31, 20),
      new Date(2026, 10, 2, 9),
    ]);
    await openLookBack();

    const years = await screen.findAllByTestId("look-back-year");
    expect(years).toHaveLength(2);
    const thisYear = within(years[0]);
    const thisYearLinks = thisYear.getAllByRole("link");
    expect(thisYearLinks[0]).toHaveAccessibleName("Your 2026 with Ato");
    expect(thisYearLinks[1]).toHaveAccessibleName("November, 1 stamp");
    expect(thisYearLinks[2]).toHaveAccessibleName("October, 2 stamps");
    expect(within(years[1]).getAllByRole("link")).toHaveLength(2);
  });

  test("a year opens its review, and a month its image", async () => {
    await saveRally([new Date(2026, 9, 3, 9)]);
    const app = await openLookBack();
    const user = userEvent.setup();

    await user.press(
      await screen.findByRole("link", { name: "October, 1 stamp" }),
    );
    await waitFor(() => {
      expect(app.getPathname()).toBe("/share-month");
    });
    expect(app.getSearchParams()).toEqual({ month: "2026-10" });

    await act(() => {
      router.back();
    });
    await user.press(
      await screen.findByRole("link", { name: "Your 2026 with Ato" }),
    );
    await waitFor(() => {
      expect(app.getPathname()).toBe("/year-review");
    });
    expect(app.getSearchParams()).toEqual({ year: "2026" });
  });
});
