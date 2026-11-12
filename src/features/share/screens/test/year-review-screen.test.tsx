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
  jest.setSystemTime(new Date(2026, 11, 10, 12));
  await deleteAllRallies();
});

async function saveRally(name: string, emoji: string, days: Date[]) {
  await ralliesDb.saveRally({ name, emoji });
  const rally = (await ralliesDb.listRallies()).find(
    (candidate) => candidate.name === name,
  );
  if (!rally) throw new Error(`Rally ${name} not found`);
  for (const day of days) {
    await saveStamp({ rallyId: rally.id, stampedAt: day.toISOString() });
  }
  return rally;
}

async function openYearReview(year: string) {
  const app = await renderRouter("./src/app");
  await act(() => {
    router.push({ pathname: "/year-review", params: { year } });
  });
  expect(await screen.findByTestId("year-review")).toBeOnTheScreen();
  return app;
}

describe("S-058 T-004 ST-004 year review", () => {
  test("shows the year in 4 pages: the count, rallies, months, first and last", async () => {
    await saveRally("行ったカフェ", "☕", [
      new Date(2026, 0, 3, 9),
      new Date(2026, 4, 7, 9),
      new Date(2026, 9, 20, 20),
    ]);
    await saveRally("読んだ本", "📚", [new Date(2026, 1, 14, 9)]);
    // Another year's stamp is not in 2026's review.
    await saveRally("去年", "🗼", [new Date(2025, 11, 30, 9)]);

    await openYearReview("2026");

    const pages = screen.getAllByTestId("share-image");
    expect(pages).toHaveLength(4);
    // ① The year's count.
    const count = within(pages[0]);
    expect(count.getByText("Your year")).toBeOnTheScreen();
    expect(count.getByText("4")).toBeOnTheScreen();
    expect(count.getByText("2 rallies")).toBeOnTheScreen();
    // ② Rallies, most stamped first.
    const rallyRows = within(pages[1]).getAllByTestId("year-rally-row");
    expect(within(rallyRows[0]).getByText("行ったカフェ")).toBeOnTheScreen();
    expect(within(rallyRows[0]).getByText("3")).toBeOnTheScreen();
    expect(within(rallyRows[1]).getByText("読んだ本")).toBeOnTheScreen();
    expect(within(pages[1]).queryByText("去年")).toBeNull();
    // ③ Months: one row per rally and 12 cells; October is the orange cell.
    const monthRows = within(pages[2]).getAllByTestId("year-grid-row");
    expect(monthRows).toHaveLength(2);
    expect(within(monthRows[0]).getAllByTestId(/^year-cell/)).toHaveLength(12);
    expect(
      within(monthRows[0]).getAllByTestId("year-cell-stamped"),
    ).toHaveLength(2);
    expect(within(pages[2]).getAllByTestId("year-cell-latest")).toHaveLength(1);
    // ④ The first and the last stamps.
    const firstAndLast = within(pages[3]);
    expect(firstAndLast.getByText("Jan 3")).toBeOnTheScreen();
    expect(firstAndLast.getByText("Oct 20")).toBeOnTheScreen();
  });

  test("Close goes back", async () => {
    await saveRally("行ったカフェ", "☕", [new Date(2026, 0, 3, 9)]);
    const app = await openYearReview("2026");

    await userEvent
      .setup()
      .press(screen.getByRole("button", { name: "Close" }));

    await waitFor(() => {
      expect(app.getPathname()).toBe("/");
    });
  });

  test.each([
    ["/year-review?year=2027"],
    ["/year-review?year=abc"],
    ["/year-review"],
    // A year without stamps has nothing to look back on.
    ["/year-review?year=2024"],
  ] as const)("%s closes the screen", async (href) => {
    await saveRally("行ったカフェ", "☕", [new Date(2026, 0, 3, 9)]);
    const app = await renderRouter("./src/app");

    await act(() => {
      router.push(href);
    });

    await waitFor(() => {
      expect(app.getPathname()).toBe("/");
    });
  });
});
