import { renderRouter } from "expo-router/testing-library";

import {
  act,
  fireEvent,
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";
import { State } from "react-native-gesture-handler";
import {
  fireGestureHandler,
  getByGestureTestId,
} from "react-native-gesture-handler/jest-utils";

import * as ralliesDb from "../../db/rallies-db";
import * as stampsDb from "../../db/stamps-db";

jest.useFakeTimers();

afterEach(() => {
  jest.restoreAllMocks();
});

const daysAgo = (days: number) =>
  new Date(2026, 8, 20 - days, 12).toISOString();

// Tests in this file share one in-memory database.
async function deleteAllRallies() {
  for (const rally of await ralliesDb.listRallies()) {
    await ralliesDb.deleteRally(rally.id);
  }
}

async function saveRallyWithStamps(
  name: string,
  stampCount: number,
  isFavorite = false,
) {
  await ralliesDb.saveRally({ name });
  const rally = (await ralliesDb.listRallies()).find(
    (saved) => saved.name === name,
  );
  if (!rally) throw new Error(`rally ${name} not saved`);
  for (let index = 0; index < stampCount; index += 1) {
    await stampsDb.saveStamp({
      rallyId: rally.id,
      stampedAt: daysAgo(index + 1),
    });
  }
  if (isFavorite) {
    await ralliesDb.setRallyFavorite({ id: rally.id, isFavorite: true });
  }
  return rally;
}

function ralliesList() {
  return within(screen.getByLabelText("Rallies list"));
}

function tileNames() {
  return ralliesList()
    .queryAllByRole("button", { name: /^View .* details$/ })
    .map((tile) => tile.props.accessibilityLabel);
}

async function openRalliesList() {
  await renderRouter("./src/app", { initialUrl: "/rallies-list" });
  expect(await screen.findByLabelText("Rallies list")).toBeOnTheScreen();
  return userEvent.setup();
}

describe("S-039 T-001 ST-002 rallies list", () => {
  beforeEach(async () => {
    jest.setSystemTime(new Date(2026, 8, 20, 9, 0));
    await deleteAllRallies();
  });

  test("shows every rally under All in the home order", async () => {
    await saveRallyWithStamps("Few favorite", 1, true);
    await saveRallyWithStamps("Many stamps", 3);
    await saveRallyWithStamps("No stamps", 0);

    await openRalliesList();

    await waitFor(() => {
      expect(tileNames()).toEqual([
        "View Few favorite details",
        "View Many stamps details",
        "View No stamps details",
      ]);
    });
    expect(
      ralliesList().getByRole("heading", { name: "Your Days" }),
    ).toBeOnTheScreen();
    expect(screen.getByTestId("rallies-list-filter")).toHaveProp(
      "selection",
      "all",
    );
  });

  test("shows only favorites under Favorites", async () => {
    await saveRallyWithStamps("Loved", 1, true);
    await saveRallyWithStamps("Plain", 3);

    await openRalliesList();
    await waitFor(() => {
      expect(tileNames()).toHaveLength(2);
    });

    await fireEvent(
      screen.getByTestId("rallies-list-filter"),
      "selectionChange",
      {
        nativeEvent: { selection: "favorites" },
      },
    );

    await waitFor(() => {
      expect(tileNames()).toEqual(["View Loved details"]);
    });
  });

  test("says there are no favorites yet when none are set", async () => {
    await saveRallyWithStamps("Plain", 1);

    await openRalliesList();
    await waitFor(() => {
      expect(tileNames()).toHaveLength(1);
    });

    await fireEvent(
      screen.getByTestId("rallies-list-filter"),
      "selectionChange",
      {
        nativeEvent: { selection: "favorites" },
      },
    );

    expect(
      await ralliesList().findByText("No favorites yet"),
    ).toBeOnTheScreen();
    expect(tileNames()).toEqual([]);
  });

  test("stamps today from a tile", async () => {
    await saveRallyWithStamps("Morning run", 0);

    const user = await openRalliesList();
    await user.press(
      await ralliesList().findByRole("button", {
        name: "Stamp Morning run for today",
      }),
    );

    expect(
      await ralliesList().findByRole("button", {
        name: "Morning run already stamped today",
      }),
    ).toBeOnTheScreen();
    expect(ralliesList().getByText("1 stamp")).toBeOnTheScreen();
  });

  test("opens rally detail from a tile name", async () => {
    await saveRallyWithStamps("Tokyo towers", 0);

    const user = await openRalliesList();
    await user.press(
      await ralliesList().findByRole("button", {
        name: "View Tokyo towers details",
      }),
    );

    expect(await screen.findByLabelText("Rally detail")).toBeOnTheScreen();
  });

  test("opens rally creation from the header plus", async () => {
    await openRalliesList();

    await fireEvent(screen.getByTestId("rallies-list-create"), "buttonPress");

    expect(
      await screen.findByPlaceholderText("Enter a rally name"),
    ).toBeOnTheScreen();
  });
});

describe("S-039 T-002 ST-005 Archived in the rallies list", () => {
  beforeEach(async () => {
    jest.setSystemTime(new Date(2026, 8, 20, 9, 0));
    await deleteAllRallies();
  });

  async function archive(rallyId: number) {
    await ralliesDb.setRallyArchived({ id: rallyId, isArchived: true });
  }

  async function chooseFilter(selection: string) {
    await fireEvent(
      screen.getByTestId("rallies-list-filter"),
      "selectionChange",
      { nativeEvent: { selection } },
    );
  }

  test("keeps archived rallies out of All and Favorites and lists them under Archived", async () => {
    await saveRallyWithStamps("Active", 1);
    await archive((await saveRallyWithStamps("Old plain", 3)).id);
    await archive((await saveRallyWithStamps("Old favorite", 1, true)).id);
    await saveRallyWithStamps("Active favorite", 0, true);

    await openRalliesList();
    await waitFor(() => {
      expect(tileNames()).toEqual([
        "View Active favorite details",
        "View Active details",
      ]);
    });

    await chooseFilter("favorites");
    await waitFor(() => {
      expect(tileNames()).toEqual(["View Active favorite details"]);
    });

    await chooseFilter("archived");
    await waitFor(() => {
      expect(tileNames()).toEqual([
        "View Old favorite details",
        "View Old plain details",
      ]);
    });
  });

  test("shows archived tiles without the stamp button", async () => {
    await saveRallyWithStamps("Active", 0);
    await archive((await saveRallyWithStamps("Old", 0)).id);

    await openRalliesList();
    await chooseFilter("archived");

    await waitFor(() => {
      expect(tileNames()).toEqual(["View Old details"]);
    });
    expect(
      ralliesList().queryByRole("button", { name: /^Stamp .* for today$/ }),
    ).not.toBeOnTheScreen();
    expect(ralliesList().getByText("0 stamps")).toBeOnTheScreen();
  });

  test("says there are no archived rallies when none are archived", async () => {
    await saveRallyWithStamps("Active", 0);

    await openRalliesList();
    await chooseFilter("archived");

    expect(
      await ralliesList().findByText("No archived rallies"),
    ).toBeOnTheScreen();
  });
});

describe("S-039 T-003 ST-002 swipe between list tabs", () => {
  beforeEach(async () => {
    jest.setSystemTime(new Date(2026, 8, 20, 9, 0));
    await deleteAllRallies();
  });

  async function swipe(translationX: number) {
    await act(() => {
      fireGestureHandler(getByGestureTestId("rallies-list-swipe"), [
        { state: State.BEGAN, translationX: 0 },
        { state: State.ACTIVE, translationX },
        { state: State.END, translationX },
      ]);
    });
  }

  function selectedFilter() {
    return screen.getByTestId("rallies-list-filter").props.selection;
  }

  test("moves to the next tab on a left swipe and back on a right swipe", async () => {
    await saveRallyWithStamps("Active", 0);
    await saveRallyWithStamps("Loved", 0, true);
    const old = await saveRallyWithStamps("Old", 0);
    await ralliesDb.setRallyArchived({ id: old.id, isArchived: true });

    await openRalliesList();
    await waitFor(() => {
      expect(tileNames()).toHaveLength(2);
    });

    await swipe(-120);
    await waitFor(() => {
      expect(tileNames()).toEqual(["View Loved details"]);
    });
    expect(selectedFilter()).toBe("favorites");

    await swipe(-120);
    await waitFor(() => {
      expect(tileNames()).toEqual(["View Old details"]);
    });
    expect(selectedFilter()).toBe("archived");

    await swipe(120);
    expect(selectedFilter()).toBe("favorites");
  });

  test("stays on the first and last tab at the ends", async () => {
    await openRalliesList();

    await swipe(120);
    expect(selectedFilter()).toBe("all");

    await swipe(-120);
    await swipe(-120);
    await swipe(-120);
    expect(selectedFilter()).toBe("archived");
  });

  test("ignores a short horizontal move", async () => {
    await openRalliesList();

    await swipe(-20);

    expect(selectedFilter()).toBe("all");
  });
});
