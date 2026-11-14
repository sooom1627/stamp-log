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
}

async function openShareYear(page: string) {
  await renderRouter("./src/app");
  await act(() => {
    router.push({ pathname: "/share-year", params: { year: "2026", page } });
  });
  expect(await screen.findByTestId("share-year-sheet")).toBeOnTheScreen();
}

describe("S-058 T-004 ST-005 share year sheet", () => {
  test("previews the page and leaves out a rally turned off", async () => {
    await saveRally("行ったカフェ", "☕", [
      new Date(2026, 0, 3, 9),
      new Date(2026, 4, 7, 9),
    ]);
    await saveRally("ひみつ", "🤫", [new Date(2026, 9, 20, 9)]);
    await openShareYear("2");

    // The year above the heading, and again in the image's head.
    expect(screen.getAllByText("2026")).toHaveLength(2);
    const image = () => within(screen.getByTestId("share-image"));
    expect(image().getByText("Rallies")).toBeOnTheScreen();
    expect(image().getAllByTestId("year-rally-row")).toHaveLength(2);

    await userEvent
      .setup()
      .press(screen.getByRole("checkbox", { name: "🤫 ひみつ" }));

    expect(image().getAllByTestId("year-rally-row")).toHaveLength(1);
    expect(image().queryByText("ひみつ")).toBeNull();
  });

  test("with every rally off, Share cannot be pressed", async () => {
    await saveRally("ひみつ", "🤫", [new Date(2026, 9, 20, 9)]);
    await openShareYear("1");

    await userEvent
      .setup()
      .press(screen.getByRole("checkbox", { name: "🤫 ひみつ" }));

    expect(screen.getByRole("button", { name: "Share" })).toBeDisabled();
  });

  test.each([
    ["/share-year?year=2026&page=5"],
    ["/share-year?year=2027&page=1"],
    ["/share-year?year=2026"],
    ["/share-year?year=2024&page=1"],
  ] as const)("%s closes the sheet", async (href) => {
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

test("S-058 T-004 ST-005 two invalid params close only the sheet, not the year review under it", async () => {
  await saveRally("行ったカフェ", "☕", [new Date(2026, 0, 3, 9)]);
  const app = await renderRouter("./src/app");
  await act(() => {
    router.push({ pathname: "/year-review", params: { year: "2026" } });
  });
  expect(await screen.findByTestId("year-review")).toBeOnTheScreen();

  await act(() => {
    router.push("/share-year?year=abc&page=9");
  });

  await waitFor(() => {
    expect(app.getPathname()).toBe("/year-review");
  });
});
