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
import { captureRef } from "react-native-view-shot";

import * as ralliesDb from "@/shared/db/rallies-db";
import { saveStamp } from "@/shared/db/stamps-db";

jest.useFakeTimers();

beforeEach(() => {
  jest.setSystemTime(new Date(2026, 9, 26, 12));
  jest.mocked(captureRef).mockClear();
  jest.mocked(shareAsync).mockClear();
});

async function saveRallyWithStamps(name: string, days: Date[]) {
  await ralliesDb.saveRally({ name, emoji: "☕" });
  const rally = (await ralliesDb.listRallies()).find(
    (candidate) => candidate.name === name,
  );
  if (!rally) throw new Error(`Rally ${name} not found`);
  for (const day of days) {
    await saveStamp({ rallyId: rally.id, stampedAt: day.toISOString() });
  }
  return rally;
}

async function openShareRally(rallyId: number) {
  const app = await renderRouter("./src/app");
  await act(() => {
    router.push({ pathname: "/share-rally", params: { rallyId } });
  });
  expect(await screen.findByTestId("share-rally-sheet")).toBeOnTheScreen();
  // An open sheet has its own path, so "/" below means the sheet closed.
  expect(app.getPathname()).toBe("/share-rally");
  return app;
}

describe("S-058 T-001 ST-004 share rally sheet", () => {
  test("previews the rally image: name, count, period and one dot per stamp", async () => {
    const rally = await saveRallyWithStamps("行ったカフェ", [
      new Date(2026, 2, 2, 9),
      new Date(2026, 5, 10, 18),
      new Date(2026, 9, 25, 21),
    ]);

    await openShareRally(rally.id);

    expect(screen.getByText("☕ 行ったカフェ")).toBeOnTheScreen();
    expect(
      screen.getByRole("heading", { name: "Share image" }),
    ).toBeOnTheScreen();
    const image = within(screen.getByTestId("share-image"));
    expect(image.getByText("Rally")).toBeOnTheScreen();
    expect(image.getByText("Mar 2 – Oct 25, 2026")).toBeOnTheScreen();
    expect(image.getByText("行ったカフェ")).toBeOnTheScreen();
    expect(image.getByText("3")).toBeOnTheScreen();
    expect(image.getByText("stamps")).toBeOnTheScreen();
    expect(image.getByText("Look back. It's all there.")).toBeOnTheScreen();
    const dots = image.getAllByTestId("rally-dot");
    expect(dots).toHaveLength(3);
    // Only the newest stamp is orange (brand.md 3.3).
    expect(dots.at(-1)).toHaveProp(
      "className",
      expect.stringContaining("bg-accent"),
    );
    expect(dots[0]).toHaveProp(
      "className",
      expect.stringContaining("bg-foreground"),
    );
  });

  test("says stamp for a single stamp", async () => {
    const rally = await saveRallyWithStamps("一度だけ", [
      new Date(2026, 9, 25, 8),
    ]);

    await openShareRally(rally.id);

    const image = within(screen.getByTestId("share-image"));
    expect(image.getByText("stamp")).toBeOnTheScreen();
    expect(image.getByText("Oct 25, 2026")).toBeOnTheScreen();
  });

  test("Share captures the preview and opens the iOS share sheet with it", async () => {
    const rally = await saveRallyWithStamps("送るカフェ", [
      new Date(2026, 9, 20, 9),
    ]);
    await openShareRally(rally.id);

    await userEvent
      .setup()
      .press(screen.getByRole("button", { name: "Share" }));

    await waitFor(() => {
      expect(shareAsync).toHaveBeenCalledWith(
        "file:///tmp/share-image.png",
        expect.objectContaining({ mimeType: "image/png" }),
      );
    });
    expect(captureRef).toHaveBeenCalledTimes(1);
    // The sheet stays open after the share sheet closes.
    expect(screen.getByTestId("share-rally-sheet")).toBeOnTheScreen();
  });

  test("a rally without stamps has nothing to share and closes", async () => {
    const rally = await saveRallyWithStamps("まだ空", []);
    const app = await renderRouter("./src/app");

    await act(() => {
      router.push({ pathname: "/share-rally", params: { rallyId: rally.id } });
    });

    await waitFor(() => {
      expect(app.getPathname()).toBe("/");
    });
  });

  test.each([
    ["/share-rally?rallyId=abc"],
    ["/share-rally"],
    ["/share-rally?rallyId=999999"],
  ] as const)("%s closes the sheet", async (href) => {
    const app = await renderRouter("./src/app");

    await act(() => {
      router.push(href);
    });

    await waitFor(() => {
      expect(app.getPathname()).toBe("/");
    });
  });
});
