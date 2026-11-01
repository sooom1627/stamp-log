import { AppState, type AppStateStatus } from "react-native";

import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, screen, within } from "@testing-library/react-native";

import * as ralliesDb from "@/shared/db/rallies-db";
import * as stampsDb from "@/shared/db/stamps-db";

jest.useFakeTimers();

afterEach(() => {
  jest.restoreAllMocks();
});

// Tests in this file share one in-memory database.
async function deleteAllRallies() {
  for (const rally of await ralliesDb.listRallies()) {
    await ralliesDb.deleteRally(rally.id);
  }
}

async function saveRallyStampedAt(name: string, stampedAt: Date) {
  await ralliesDb.saveRally({ name, emoji: "🗼" });
  const rally = (await ralliesDb.listRallies()).find(
    (saved) => saved.name === name,
  );
  if (!rally) throw new Error(`rally ${name} not saved`);
  await stampsDb.saveStamp({
    rallyId: rally.id,
    stampedAt: stampedAt.toISOString(),
  });
  return rally;
}

// The large title is a native header prop, not text in the tree.
function largeTitles() {
  return screen.container
    .queryAll((instance) => instance.type === "RNSScreenStackHeaderConfig")
    .map((instance) => instance.props.title)
    .filter((title) => title !== "(tabs)");
}

// The OS tells the app it came back through AppState; the test plays the OS.
function captureAppStateListeners() {
  const listeners: ((state: AppStateStatus) => void)[] = [];
  jest
    .spyOn(AppState, "addEventListener")
    .mockImplementation((_type, listener) => {
      listeners.push(listener);
      return { remove: jest.fn() };
    });
  return (state: AppStateStatus) =>
    listeners.forEach((listener) => listener(state));
}

describe("S-057 T-001 ST-003 the screens follow the new day", () => {
  beforeEach(async () => {
    await deleteAllRallies();
  });

  test("home turns to the new day when midnight passes while it is open", async () => {
    jest.setSystemTime(new Date(2026, 8, 20, 23, 59));
    await saveRallyStampedAt("Tokyo towers", new Date(2026, 8, 20, 22, 0));

    await renderRouter("./src/app");
    const card = await screen.findByTestId("today-card");
    expect(card).toHaveAccessibleName(/^Today, Sep 20, 1 stamp/);
    expect(largeTitles()).toContain("September 20");
    expect(screen.getByText("Sunday")).toBeOnTheScreen();

    await act(async () => {
      jest.advanceTimersByTime(61_000);
    });

    expect(screen.getByTestId("today-card")).toHaveAccessibleName(
      /^Today, Sep 21, /,
    );
    expect(
      within(screen.getByTestId("today-card")).queryByText("Tokyo towers"),
    ).not.toBeOnTheScreen();
    expect(largeTitles()).toContain("September 21");
    expect(screen.getByText("Monday")).toBeOnTheScreen();
  });

  test("home turns to the new day when the app comes back on a later day", async () => {
    const emit = captureAppStateListeners();
    jest.setSystemTime(new Date(2026, 8, 20, 21, 0));
    await saveRallyStampedAt("Tokyo towers", new Date(2026, 8, 20, 20, 0));

    await renderRouter("./src/app");
    expect(await screen.findByTestId("today-card")).toHaveAccessibleName(
      /^Today, Sep 20, 1 stamp/,
    );

    // JS timers stop while iOS keeps the app in the background.
    jest.setSystemTime(new Date(2026, 8, 21, 8, 0));
    await act(async () => {
      emit("background");
      emit("active");
    });

    expect(screen.getByTestId("today-card")).toHaveAccessibleName(
      /^Today, Sep 21, /,
    );
    expect(largeTitles()).toContain("September 21");
  });

  test("a rally's timeline heading turns from Today to Yesterday at midnight", async () => {
    jest.setSystemTime(new Date(2026, 8, 20, 23, 59));
    const rally = await saveRallyStampedAt(
      "Timeline",
      new Date(2026, 8, 20, 22, 0),
    );

    await renderRouter("./src/app");
    await act(() => {
      router.push(`/rallies/${rally.id}`);
    });
    // The Logs tab shows the same day too, so look inside the rally only.
    const headingOfSep20 = () =>
      within(
        within(screen.getByLabelText("Rally detail")).getByTestId(
          "day-section-2026-09-20",
        ),
      ).getByRole("heading");
    await within(await screen.findByLabelText("Rally detail")).findByTestId(
      "day-section-2026-09-20",
    );
    expect(headingOfSep20()).toHaveTextContent("Today");

    await act(async () => {
      jest.advanceTimersByTime(61_000);
    });

    expect(headingOfSep20()).toHaveTextContent("Yesterday");
  });
});
