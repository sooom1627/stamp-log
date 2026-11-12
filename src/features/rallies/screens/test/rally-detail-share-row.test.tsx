import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, screen, userEvent, within } from "@testing-library/react-native";

import * as ralliesDb from "@/shared/db/rallies-db";
import { saveStamp } from "@/shared/db/stamps-db";
import { offScaleClassNames } from "@/shared/utils/test-helpers/design-rules";

jest.useFakeTimers();

beforeEach(() => {
  jest.setSystemTime(new Date(2026, 9, 26, 12));
});

async function openRallyDetail(name: string, days: Date[]) {
  await ralliesDb.saveRally({ name, emoji: "☕" });
  const rally = (await ralliesDb.listRallies()).find(
    (candidate) => candidate.name === name,
  );
  if (!rally) throw new Error(`Rally ${name} not found`);
  for (const day of days) {
    await saveStamp({ rallyId: rally.id, stampedAt: day.toISOString() });
  }

  const app = await renderRouter("./src/app");
  await act(() => {
    router.push(`/rallies/${rally.id}`);
  });
  // The rally's stamps are read when the screen opens.
  await within(await screen.findByTestId("rally-top-panel-count")).findByText(
    /^\d+ stamps?$/,
  );

  return { app, rally, calendar: within(screen.getByTestId("rally-calendar")) };
}

describe("S-058 T-001 ST-005 share row on rally detail", () => {
  test("shows the rally's whole count and first day under the calendar days", async () => {
    const { calendar } = await openRallyDetail("行ったカフェ", [
      new Date(2026, 2, 2, 9),
      new Date(2026, 7, 14, 9),
      new Date(2026, 9, 25, 21),
    ]);

    // Inside the calendar panel, below the days.
    const row = within(screen.getByTestId("rally-calendar-panel")).getByTestId(
      "share-row",
    );
    expect(within(row).getByText("3 stamps · since Mar 2")).toBeOnTheScreen();
    expect(offScaleClassNames(row)).toEqual([]);
    expect(
      calendar.getByRole("button", { name: "Share image" }),
    ).toBeOnTheScreen();
  });

  test("keeps the whole rally when the calendar moves to another month", async () => {
    await openRallyDetail("月を送るカフェ", [
      new Date(2025, 11, 2, 9),
      new Date(2026, 9, 25, 21),
    ]);

    await userEvent.setup().press(
      within(screen.getByLabelText("Rally detail")).getByRole("button", {
        name: "Previous month",
      }),
    );

    expect(
      within(screen.getByTestId("rally-calendar")).getByText("September 2026"),
    ).toBeOnTheScreen();
    expect(
      within(screen.getByTestId("share-row")).getByText(
        "2 stamps · since Dec 2, 2025",
      ),
    ).toBeOnTheScreen();
  });

  test("Share opens the share sheet with this rally", async () => {
    const { app, rally } = await openRallyDetail("送るラリー", [
      new Date(2026, 9, 20, 9),
    ]);

    await userEvent
      .setup()
      .press(screen.getByRole("button", { name: "Share image" }));

    expect(await screen.findByTestId("share-rally-sheet")).toBeOnTheScreen();
    expect(app.getPathname()).toBe("/share-rally");
    expect(app.getSearchParams()).toEqual({ rallyId: String(rally.id) });
  });

  test("is not shown for a rally without stamps", async () => {
    await ralliesDb.saveRally({ name: "空のラリー", emoji: "🌱" });
    const rally = (await ralliesDb.listRallies()).find(
      (candidate) => candidate.name === "空のラリー",
    );
    await renderRouter("./src/app");
    await act(() => {
      router.push(`/rallies/${rally?.id}`);
    });
    await screen.findByLabelText("Rally detail");
    expect(await screen.findByText("No stamps yet")).toBeOnTheScreen();

    expect(screen.queryByTestId("share-row")).toBeNull();
  });
});
