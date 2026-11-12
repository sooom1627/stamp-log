import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";
import { shareAsync } from "expo-sharing";

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
  jest.setSystemTime(new Date(2026, 10, 3, 12));
  jest.mocked(shareAsync).mockClear();
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

async function openShareMonth(month: string) {
  const app = await renderRouter("./src/app");
  await act(() => {
    router.push({ pathname: "/share-month", params: { month } });
  });
  expect(await screen.findByTestId("share-month-sheet")).toBeOnTheScreen();
  expect(app.getPathname()).toBe("/share-month");
  return app;
}

describe("S-058 T-003 ST-004 share month sheet", () => {
  test("labels every 7th day from the 1st above the cells", async () => {
    await saveRally("行ったカフェ", "☕", [new Date(2026, 9, 1, 9)]);

    await openShareMonth("2026-10");

    const labels = within(screen.getByTestId("month-grid-days"));
    expect(
      labels.getAllByText(/^\d+$/).map((label) => label.props.children),
    ).toEqual([1, 8, 15, 22, 29]);
  });

  test("previews the month image: count, rallies, one row per rally and the list", async () => {
    await saveRally("読んだ本", "📚", [new Date(2026, 9, 3, 9)]);
    await saveRally("行ったカフェ", "☕", [
      new Date(2026, 9, 1, 9),
      new Date(2026, 9, 7, 9),
      new Date(2026, 9, 31, 20),
    ]);
    // Another month's stamp is not in October's image.
    await saveRally("先月より前", "🗼", [new Date(2026, 8, 30, 9)]);

    await openShareMonth("2026-10");

    // The year above the heading, and again in the image's head.
    expect(screen.getAllByText("2026")).toHaveLength(2);
    expect(
      screen.getByRole("heading", { name: "Share image" }),
    ).toBeOnTheScreen();
    const image = within(screen.getByTestId("share-image"));
    expect(image.getByText("October")).toBeOnTheScreen();
    expect(image.getByText("2026")).toBeOnTheScreen();
    expect(image.getByText("4")).toBeOnTheScreen();
    expect(image.getByText("stamps")).toBeOnTheScreen();
    expect(image.getByText("2 rallies")).toBeOnTheScreen();
    // Rows: the most stamped rally first.
    const rows = image.getAllByTestId("month-grid-row");
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText("☕")).toBeOnTheScreen();
    expect(within(rows[1]).getByText("📚")).toBeOnTheScreen();
    // Oct 1 and 7 in navy; Oct 31, the last stamp, is the orange cell.
    expect(within(rows[0]).getAllByTestId("month-cell-stamped")).toHaveLength(
      2,
    );
    // Only the month's last stamp (Oct 31) is orange.
    expect(image.getAllByTestId("month-cell-latest")).toHaveLength(1);
    expect(within(rows[0]).getByTestId("month-cell-latest")).toBeOnTheScreen();
    expect(within(rows[0]).getAllByTestId(/^month-cell/)).toHaveLength(31);
    expect(image.queryByText("先月より前")).toBeNull();
    const list = within(image.getByTestId("month-share-list"));
    expect(list.getByText("行ったカフェ")).toBeOnTheScreen();
    expect(list.getByText("3")).toBeOnTheScreen();
  });

  test("a rally turned off leaves the image, which counts again without it", async () => {
    await saveRally("行ったカフェ", "☕", [
      new Date(2026, 9, 1, 9),
      new Date(2026, 9, 7, 9),
    ]);
    await saveRally("ひみつ", "🤫", [new Date(2026, 9, 20, 9)]);
    await openShareMonth("2026-10");
    const user = userEvent.setup();

    // Every rally stamped in the month starts on, in the rows' order.
    const toggles = screen.getAllByRole("checkbox");
    expect(toggles).toHaveLength(2);
    expect(toggles[0]).toHaveAccessibleName("☕ 行ったカフェ");
    expect(toggles[1]).toHaveAccessibleName("🤫 ひみつ");
    expect(toggles[1]).toBeChecked();

    await user.press(screen.getByRole("checkbox", { name: "🤫 ひみつ" }));

    expect(
      screen.getByRole("checkbox", { name: "🤫 ひみつ" }),
    ).not.toBeChecked();
    const image = within(screen.getByTestId("share-image"));
    expect(image.queryByText("ひみつ")).toBeNull();
    expect(image.getAllByTestId("month-grid-row")).toHaveLength(1);
    // The big number and the list both count 2 stamps.
    expect(image.getAllByText("2")).toHaveLength(2);
    expect(image.getByText("1 rally")).toBeOnTheScreen();
    // The last stamp left is Oct 7's, so it is now the orange cell.
    expect(image.getAllByTestId("month-cell-latest")).toHaveLength(1);
  });

  test("with every rally off, Share cannot be pressed", async () => {
    await saveRally("ひみつ", "🤫", [new Date(2026, 9, 20, 9)]);
    await openShareMonth("2026-10");

    await userEvent
      .setup()
      .press(screen.getByRole("checkbox", { name: "🤫 ひみつ" }));

    expect(screen.getByRole("button", { name: "Share" })).toBeDisabled();
  });

  test("Share opens the iOS share sheet with the image", async () => {
    await saveRally("送る月", "🏃", [new Date(2026, 9, 12, 9)]);
    await openShareMonth("2026-10");

    await userEvent
      .setup()
      .press(screen.getByRole("button", { name: "Share" }));

    await waitFor(() => {
      expect(shareAsync).toHaveBeenCalledWith(
        "file:///tmp/share-image.png",
        expect.objectContaining({ mimeType: "image/png" }),
      );
    });
  });

  test.each([
    ["/share-month?month=2026-13"],
    ["/share-month?month=2026-12"],
    ["/share-month"],
    // A month without stamps has nothing to share.
    ["/share-month?month=2026-08"],
  ] as const)("%s closes the sheet", async (href) => {
    await saveRally("ほかの月", "🌱", [new Date(2026, 9, 12, 9)]);
    const app = await renderRouter("./src/app");

    await act(() => {
      router.push(href);
    });

    await waitFor(() => {
      expect(app.getPathname()).toBe("/");
    });
  });
});
