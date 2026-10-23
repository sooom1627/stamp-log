import { renderRouter } from "expo-router/testing-library";

import {
  fireEvent,
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";

import * as ralliesDb from "../../db/rallies-db";
import * as stampsDb from "../../db/stamps-db";

jest.useFakeTimers();

// The native commands the pager sends to turn its page. Jest loads the
// package's CommonJS build, so spy on that copy.
const { Commands: PagerViewCommands } = jest.requireActual<
  typeof import("react-native-pager-view/lib/typescript/PagerViewNativeComponent")
>("react-native-pager-view/lib/commonjs/PagerViewNativeComponent");

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

function selectedFilter() {
  return screen.getByTestId("rallies-list-filter").props.selection;
}

// Every tab is a page and all are rendered (S-043); read the chosen one.
function shownPage() {
  return within(screen.getByTestId(`rallies-list-pager-${selectedFilter()}`));
}

function tileNames() {
  return shownPage()
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
      shownPage().queryByRole("button", { name: /^Stamp .* for today$/ }),
    ).not.toBeOnTheScreen();
    expect(shownPage().getByText("0 stamps")).toBeOnTheScreen();
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

describe("S-043 T-002 ST-002 pages for the list tabs", () => {
  beforeEach(async () => {
    jest.setSystemTime(new Date(2026, 8, 20, 9, 0));
    await deleteAllRallies();
  });

  test("keeps the heading and the tabs above three pages, All, Favorites and Archived", async () => {
    await saveRallyWithStamps("Active", 0);
    await saveRallyWithStamps("Loved", 0, true);
    const old = await saveRallyWithStamps("Old", 0);
    await ralliesDb.setRallyArchived({ id: old.id, isArchived: true });

    await openRalliesList();

    const pager = within(screen.getByTestId("rallies-list-pager"));
    expect(
      pager.queryByRole("heading", { name: "Your Days" }),
    ).not.toBeOnTheScreen();
    expect(pager.queryByTestId("rallies-list-filter")).not.toBeOnTheScreen();
    const names = (page: string) =>
      within(pager.getByTestId(`rallies-list-pager-${page}`))
        .queryAllByRole("button", { name: /^View .* details$/ })
        .map((tile) => tile.props.accessibilityLabel);
    await waitFor(() => {
      expect(names("all")).toEqual([
        "View Loved details",
        "View Active details",
      ]);
    });
    expect(names("favorites")).toEqual(["View Loved details"]);
    expect(names("archived")).toEqual(["View Old details"]);
  });

  test("turning the page changes the tab", async () => {
    await openRalliesList();
    const pager = screen.getByTestId("rallies-list-pager");

    await fireEvent(pager, "pageSelected", { nativeEvent: { position: 2 } });
    expect(selectedFilter()).toBe("archived");

    await fireEvent(pager, "pageSelected", { nativeEvent: { position: 1 } });
    expect(selectedFilter()).toBe("favorites");
  });

  test("choosing a tab turns the page", async () => {
    // The page turn itself is native; check that it is asked for.
    const setPage = jest.spyOn(PagerViewCommands, "setPage");
    await openRalliesList();

    await fireEvent(
      screen.getByTestId("rallies-list-filter"),
      "selectionChange",
      { nativeEvent: { selection: "archived" } },
    );

    expect(setPage).toHaveBeenLastCalledWith(expect.anything(), 2);
  });

  test("shows one load error above the pages", async () => {
    jest
      .spyOn(ralliesDb, "listRallies")
      .mockRejectedValue(new Error("disk full"));

    await openRalliesList();

    expect(
      await ralliesList().findByRole("button", { name: "Retry" }),
    ).toBeOnTheScreen();
    expect(
      ralliesList().getAllByRole("button", { name: "Retry" }),
    ).toHaveLength(1);
  });
});
