import { Alert } from "react-native";

import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import {
  act,
  fireEvent,
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";
import { toast } from "sonner-native";

import * as ralliesDb from "@/shared/db/rallies-db";
import * as stampSummaryDb from "@/shared/db/stamp-summary-db";
import * as stampsDb from "@/shared/db/stamps-db";

jest.useFakeTimers();

beforeEach(() => {
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Tests in this file share one in-memory database.
async function deleteAllRallies() {
  for (const rally of await ralliesDb.listRallies()) {
    await ralliesDb.deleteRally(rally.id);
  }
}

function findToastAction(): { label: string; onClick: () => void } {
  const options = jest.mocked(toast).mock.calls.at(-1)?.[1];
  const action = options?.action;
  if (
    !action ||
    typeof action !== "object" ||
    !("onClick" in action) ||
    typeof action.onClick !== "function"
  ) {
    throw new Error("toast action not found");
  }
  return action;
}

async function renderHomeWithRally(name: string) {
  await ralliesDb.saveRally({ name });
  await renderRouter("./src/app");
  expect(
    await screen.findByRole("button", { name: `View ${name} details` }),
  ).toBeOnTheScreen();
  return userEvent.setup();
}

describe("ST-001 create rally entry", () => {
  test("opens create screen from Create rally on home", async () => {
    await renderRouter("./src/app");

    const user = userEvent.setup();
    await user.press(await screen.findByRole("link", { name: "Create rally" }));

    expect(
      await screen.findByPlaceholderText("Enter a rally name"),
    ).toBeOnTheScreen();
    // S-028 RT-002 ST-003: the heading lives in the sheet, not a native header.
    const sheet = screen.getByTestId("create-rally-form");
    expect(
      within(sheet).getByRole("heading", { name: "Create rally" }),
    ).toBeOnTheScreen();
    expect(sheet).toHaveProp("className", expect.stringContaining("pt-8"));
  });
});

describe("S-022 section heading", () => {
  test("shows Your Days when rallies exist", async () => {
    await renderHomeWithRally("Your Days check");

    expect(
      screen.getByRole("heading", { name: "Your Days" }),
    ).toBeOnTheScreen();
  });

  test("opens rallies list from View All", async () => {
    const user = await renderHomeWithRally("View All check");

    await user.press(screen.getByRole("link", { name: "View All" }));

    const list = await screen.findByLabelText("Rallies list");
    expect(within(list).getByText("View All check")).toBeOnTheScreen();
  });
});

describe("Rally detail navigation", () => {
  test("opens rally detail from the row header", async () => {
    const user = await renderHomeWithRally("Tokyo museums");

    await user.press(
      screen.getByRole("button", { name: "View Tokyo museums details" }),
    );

    expect(await screen.findByLabelText("Rally detail")).toBeOnTheScreen();
    expect(
      screen.getByRole("heading", { name: "Tokyo museums" }),
    ).toBeOnTheScreen();
  });
});

describe("S-002 T-001 ST-004 stamp rally", () => {
  const stampedAt = "2026-09-19T12:34:00.000Z";

  beforeEach(() => {
    jest.setSystemTime(new Date(stampedAt));
  });

  test("marks today as recorded after stamping", async () => {
    const user = await renderHomeWithRally("Researchers met this year");

    await user.press(
      screen.getByRole("button", {
        name: "Stamp Researchers met this year for today",
      }),
    );

    expect(
      await screen.findByRole("button", {
        name: "Researchers met this year already stamped today",
      }),
    ).toBeDisabled();
  });

  test("stamps several rallies the same way", async () => {
    const rallies = [
      { name: "Classmates" },
      { name: "Stations on Yamanote" },
      { name: "Goals this year" },
    ] as const;

    for (const rally of rallies) {
      await ralliesDb.saveRally(rally);
    }

    await renderRouter("./src/app");
    const user = userEvent.setup();
    expect(await screen.findByText("Classmates")).toBeOnTheScreen();

    for (const rally of rallies) {
      await user.press(
        screen.getByRole("button", {
          name: `Stamp ${rally.name} for today`,
        }),
      );
    }

    expect(
      (
        await screen.findAllByRole("button", {
          name: /already stamped today/,
        })
      ).length,
    ).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText("Who")).not.toBeOnTheScreen();
    expect(screen.queryByText("Where")).not.toBeOnTheScreen();
    expect(screen.queryByText("What")).not.toBeOnTheScreen();
  });

  test("shows error toast when save fails", async () => {
    jest.spyOn(stampsDb, "saveStamp").mockRejectedValue(new Error("disk full"));
    jest.mocked(toast.error).mockClear();

    const user = await renderHomeWithRally("Failing rally");
    await user.press(
      screen.getByRole("button", {
        name: "Stamp Failing rally for today",
      }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
      );
    });
    expect(
      screen.queryByText("Could not save. Please try again."),
    ).not.toBeOnTheScreen();
    expect(Alert.alert).not.toHaveBeenCalledWith(
      "Could not save. Please try again.",
      "disk full",
    );
  });
});

describe("S-002 T-002 ST-001 memo toast", () => {
  const stampedAt = "2026-09-20T15:00:00.000Z";

  beforeEach(() => {
    jest.setSystemTime(new Date(stampedAt));
    jest.mocked(toast).mockClear();
  });

  test("shows toast on stamp and keeps stamp after it dismisses", async () => {
    const user = await renderHomeWithRally("Memo toast rally");

    await user.press(
      screen.getByRole("button", {
        name: "Stamp Memo toast rally for today",
      }),
    );

    expect(
      await screen.findByRole("button", {
        name: "Memo toast rally already stamped today",
      }),
    ).toBeDisabled();
    expect(toast).toHaveBeenCalledWith(
      "Add a memo or photos?",
      expect.objectContaining({
        duration: 5000,
        action: {
          label: "Add",
          onClick: expect.any(Function),
        },
      }),
    );

    await act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(
      screen.getByRole("button", {
        name: "Memo toast rally already stamped today",
      }),
    ).toBeDisabled();
  });
});

describe("S-002 T-002 ST-005 memo formSheet", () => {
  const stampedAt = "2026-09-21T10:00:00.000Z";

  beforeEach(() => {
    jest.setSystemTime(new Date(stampedAt));
    jest.mocked(toast).mockClear();
  });

  test("opens formSheet from Add memo and keeps recorded dot after save", async () => {
    const user = await renderHomeWithRally("Memo formSheet rally");

    await user.press(
      screen.getByRole("button", {
        name: "Stamp Memo formSheet rally for today",
      }),
    );

    expect(
      await screen.findByRole("button", {
        name: "Memo formSheet rally already stamped today",
      }),
    ).toBeDisabled();

    const action = findToastAction();
    expect(action.label).toBe("Add");

    await act(async () => {
      action.onClick();
    });

    expect(toast.dismiss).toHaveBeenCalled();
    expect(await screen.findByText("Memo")).toBeOnTheScreen();
    expect(
      screen.getByRole("heading", { name: "Memo & photos" }),
    ).toBeOnTheScreen();

    await user.type(screen.getByPlaceholderText("Enter memo"), "Met them");
    await user.press(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByRole("button", {
        name: "Memo formSheet rally already stamped today",
      }),
    ).toBeDisabled();
  });
});

describe("S-029 T-001 ST-004 today card", () => {
  const at = (day: number, hours = 12) =>
    new Date(2026, 8, day, hours).toISOString();

  beforeEach(async () => {
    jest.setSystemTime(new Date(2026, 8, 20, 9, 0));
    await deleteAllRallies();
  });

  async function saveRallyWithStamps(
    name: string,
    emoji: string,
    stampedAts: string[],
  ) {
    await ralliesDb.saveRally({ name, emoji });
    const rally = (await ralliesDb.listRallies()).find(
      (saved) => saved.name === name,
    );
    if (!rally) throw new Error(`rally ${name} not saved`);
    for (const stampedAt of stampedAts) {
      await stampsDb.saveStamp({ rallyId: rally.id, stampedAt });
    }
  }

  test("inks today's stamp with the emojis of rallies stamped today and lists them, first stamped first", async () => {
    await saveRallyWithStamps("Tokyo towers", "🗼", [at(20, 8)]);
    await saveRallyWithStamps("Morning run", "🏃", [at(20, 7)]);
    await saveRallyWithStamps("Kyoto museums", "⛩️", [at(19)]);

    await renderRouter("./src/app");
    const card = await screen.findByTestId("today-card");

    expect(card).toHaveAccessibleName(
      "Today, Sep 20, 2 stamps: Morning run, Tokyo towers, 1 of 3",
    );
    // The stamp is inked with today's emojis instead of the date.
    expect(
      within(within(card).getByTestId("today-stamp"))
        .getAllByText(/./)
        .map((t) => t.children),
    ).toEqual([["🏃"], ["🗼"]]);
    expect(within(card).queryByText("SEP")).not.toBeOnTheScreen();
    expect(within(card).getByText("2 stamps today")).toBeOnTheScreen();
    expect(within(card).getByText("Morning run · Tokyo towers")).toHaveProp(
      "numberOfLines",
      2,
    );
    expect(within(card).queryByText("Kyoto museums")).not.toBeOnTheScreen();
    expect(within(card).queryByRole("button")).not.toBeOnTheScreen();
    expect(screen.queryByText("Last 14 days")).not.toBeOnTheScreen();
    expect(screen.queryByText("STAMPS")).not.toBeOnTheScreen();
    expect(screen.queryByText(/This month/)).not.toBeOnTheScreen();
  });

  test("shows an empty date stamp until a rally is stamped from home", async () => {
    await saveRallyWithStamps("Kyoto museums", "⛩️", [at(19)]);

    await renderRouter("./src/app");
    const user = userEvent.setup();
    const card = await screen.findByTestId("today-card");
    expect(card).toHaveAccessibleName("Today, Sep 20, no stamps yet, 1 of 3");
    const emptyStamp = within(card).getByTestId("today-stamp");
    expect(within(emptyStamp).getByText("SEP")).toBeOnTheScreen();
    expect(within(emptyStamp).getByText("20")).toBeOnTheScreen();
    expect(within(card).getByText("No stamps yet today")).toBeOnTheScreen();
    expect(
      within(card).getByText("What you stamp today shows up here."),
    ).toBeOnTheScreen();

    await user.press(
      screen.getByRole("button", { name: "Stamp Kyoto museums for today" }),
    );

    expect(
      await screen.findByLabelText(
        "Today, Sep 20, 1 stamp: Kyoto museums, 1 of 3",
      ),
    ).toBeOnTheScreen();
    const stampedCard = screen.getByTestId("today-card");
    expect(within(stampedCard).getByText("1 stamp today")).toBeOnTheScreen();
    expect(
      within(within(stampedCard).getByTestId("today-stamp")).getByText("⛩️"),
    ).toBeOnTheScreen();
    expect(
      within(stampedCard).queryByText("No stamps yet today"),
    ).not.toBeOnTheScreen();
  });

  test("overlaps up to five emojis in the stamp, then four and +N, and lists every name", async () => {
    const rallies: [string, string][] = [
      ["Morning run", "🏃"],
      ["Reading", "📚"],
      ["Kyoto museums", "⛩️"],
      ["Cafe hopping", "☕"],
      ["Tokyo towers", "🗼"],
      ["Yoga", "🧘"],
      ["Sketching", "🎨"],
    ];
    for (const [index, [name, emoji]] of rallies.entries()) {
      await saveRallyWithStamps(name, emoji, [at(20, 1 + index)]);
    }

    await renderRouter("./src/app");
    const card = await screen.findByTestId("today-card");

    const stamp = within(card).getByTestId("today-stamp");
    expect(
      within(stamp)
        .getAllByTestId("today-stamp-row")
        .map((row) =>
          within(row)
            .getAllByText(/./)
            .map((t) => t.children[0]),
        ),
    ).toEqual([
      ["🏃", "📚", "⛩️"],
      ["☕", "+3"],
    ]);
    expect(within(card).getByText("7 stamps today")).toBeOnTheScreen();
    expect(
      within(card).getByText(
        "Morning run · Reading · Kyoto museums · Cafe hopping · Tokyo towers · Yoga · Sketching",
      ),
    ).toHaveProp("numberOfLines", 2);
    expect(card).toHaveAccessibleName(
      "Today, Sep 20, 7 stamps: Morning run, Reading, Kyoto museums, Cafe hopping, Tokyo towers, Yoga, Sketching, 1 of 3",
    );
  });
});

describe("S-029 T-003 ST-002 rally order", () => {
  // One stamp a day, going back from yesterday.
  const daysAgo = (days: number) =>
    new Date(2026, 8, 20 - days, 12).toISOString();

  beforeEach(async () => {
    jest.setSystemTime(new Date(2026, 8, 20, 9, 0));
    await deleteAllRallies();
  });

  async function saveRallyWithStamps(name: string, stampCount: number) {
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
    return rally;
  }

  function tileNames() {
    return within(screen.getByTestId("rally-grid"))
      .getAllByRole("button", { name: /^View .* details$/ })
      .map((tile) => tile.props.accessibilityLabel);
  }

  test("puts the most stamped rally first, the newer one first on a tie", async () => {
    await saveRallyWithStamps("Few", 1);
    await saveRallyWithStamps("Many", 3);
    await saveRallyWithStamps("None", 0);
    await saveRallyWithStamps("Few too", 1);

    await renderRouter("./src/app");
    await screen.findByRole("button", { name: "View Many details" });

    expect(tileNames()).toEqual([
      "View Many details",
      "View Few too details",
      "View Few details",
      "View None details",
    ]);
  });

  test("RT-003 ST-003 counts stamps older than the last 7 days", async () => {
    await saveRallyWithStamps("Old and new", 10);
    await saveRallyWithStamps("Recent", 3);

    await renderRouter("./src/app");
    await screen.findByRole("button", { name: "View Old and new details" });

    expect(tileNames()).toEqual([
      "View Old and new details",
      "View Recent details",
    ]);
    expect(
      within(screen.getByTestId("rally-grid")).getByText("10 stamps"),
    ).toBeOnTheScreen();
  });

  test("keeps the order while home is open and sorts again on return", async () => {
    const older = await saveRallyWithStamps("Older", 1);
    await saveRallyWithStamps("Newer", 1);

    await renderRouter("./src/app");
    const user = userEvent.setup();
    await screen.findByRole("button", { name: "View Newer details" });
    expect(tileNames()).toEqual(["View Newer details", "View Older details"]);

    // Older now has 2 stamps, but the tiles stay put while home is shown.
    await user.press(
      screen.getByRole("button", { name: "Stamp Older for today" }),
    );
    expect(
      await screen.findByRole("button", {
        name: "Older already stamped today",
      }),
    ).toBeOnTheScreen();
    expect(tileNames()).toEqual(["View Newer details", "View Older details"]);

    await act(() => {
      router.push(`/rallies/${older.id}`);
    });
    await screen.findByLabelText("Rally detail");
    await act(() => {
      router.back();
    });

    await waitFor(() =>
      expect(tileNames()).toEqual(["View Older details", "View Newer details"]),
    );
  });
});

describe("S-029 T-002 ST-001 rally tiles", () => {
  test("lays out rallies as tiles in 2 columns", async () => {
    await renderHomeWithRally("Tile grid check");

    const grid = screen.getByTestId("rally-grid");
    expect(grid).toHaveProp(
      "className",
      expect.stringContaining("flex-row flex-wrap"),
    );
    // The jest window is 750 wide: (750 - 2 * 20 padding - 10 gap) / 2.
    const tile = within(grid)
      .getAllByTestId("rally-tile")
      .find((candidate) => within(candidate).queryByText("Tile grid check"));
    expect(tile).toHaveStyle({ width: 350 });
  });
});

describe("S-029 T-002 ST-002 New rally tile", () => {
  beforeEach(async () => {
    await deleteAllRallies();
  });

  test("puts the New rally tile last in the grid and no floating button", async () => {
    await renderHomeWithRally("Last tile check");

    const grid = screen.getByTestId("rally-grid");
    const createLink = within(grid).getByRole("link", { name: "Create rally" });
    expect(within(createLink).getByText("New rally")).toBeOnTheScreen();
    expect(grid.children.at(-1)).toBe(createLink);
    expect(screen.getAllByRole("link", { name: "Create rally" })).toHaveLength(
      1,
    );
  });

  test("shows only the New rally tile when there are no rallies", async () => {
    await renderRouter("./src/app");

    const createLink = await screen.findByRole("link", {
      name: "Create rally",
    });
    expect(within(createLink).getByText("New rally")).toBeOnTheScreen();
    expect(screen.queryByText("Your Days")).not.toBeOnTheScreen();
    expect(screen.queryByText("View All")).not.toBeOnTheScreen();
    expect(screen.queryByText("No rallies yet")).not.toBeOnTheScreen();
  });
});

describe("S-033 T-001 ST-002 tiles on the canvas", () => {
  beforeEach(async () => {
    await deleteAllRallies();
  });

  test("draws rally tiles and the New rally icon with the surface color", async () => {
    await renderHomeWithRally("Surface check");

    const grid = screen.getByTestId("rally-grid");
    for (const tile of within(grid).getAllByTestId("rally-tile")) {
      expect(tile).toHaveProp(
        "className",
        expect.stringContaining("bg-surface "),
      );
    }
    expect(within(grid).getByTestId("new-rally-icon")).toHaveProp(
      "className",
      expect.stringContaining("bg-surface "),
    );
  });
});

describe("S-002 T-002 RT-002 error display", () => {
  // Logs shares the lists and has its own error, so look inside Home.
  const home = async () => within(await screen.findByLabelText("Home"));

  test("shows load error and retry when rally list fails", async () => {
    jest
      .spyOn(ralliesDb, "listRallies")
      .mockRejectedValue(new Error("disk full"));

    await renderRouter("./src/app");

    expect(await (await home()).findByText("Couldn't load")).toBeOnTheScreen();
    expect(
      (await home()).getByRole("button", { name: "Retry" }),
    ).toBeOnTheScreen();
    expect(
      screen.queryByText("Could not save. Please try again."),
    ).not.toBeOnTheScreen();
  });

  test("shows load error and retry when stamp list fails", async () => {
    jest
      .spyOn(stampSummaryDb, "getStampSummary")
      .mockRejectedValue(new Error("disk full"));

    await renderRouter("./src/app");

    expect(await (await home()).findByText("Couldn't load")).toBeOnTheScreen();
    expect(
      (await home()).getByRole("button", { name: "Retry" }),
    ).toBeOnTheScreen();
  });

  test("shows list after retrying a failed load", async () => {
    const listSpy = jest
      .spyOn(ralliesDb, "listRallies")
      .mockRejectedValue(new Error("disk full"));

    await renderRouter("./src/app");
    expect(await (await home()).findByText("Couldn't load")).toBeOnTheScreen();

    listSpy.mockResolvedValue([]);
    const user = userEvent.setup();
    await user.press((await home()).getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(screen.queryAllByText("Couldn't load")).toHaveLength(0);
    });
  });
});

describe("S-032 T-001 ST-007 favorites on home", () => {
  const daysAgo = (days: number) =>
    new Date(2026, 8, 20 - days, 12).toISOString();

  beforeEach(async () => {
    jest.setSystemTime(new Date(2026, 8, 20, 9, 0));
    await deleteAllRallies();
  });

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

  function tileNames() {
    return within(screen.getByTestId("rally-grid"))
      .getAllByRole("button", { name: /^View .* details$/ })
      .map((tile) => tile.props.accessibilityLabel);
  }

  async function pressStarOnDetailAndReturn(rallyId: number, label: string) {
    await act(() => {
      router.push(`/rallies/${rallyId}`);
    });
    const star = await screen.findByTestId("rally-favorite");
    await fireEvent(star, "buttonPress");
    await waitFor(() => {
      expect(screen.getByTestId("rally-favorite")).toHaveProp("label", label);
    });
    await act(() => {
      router.back();
    });
  }

  test("puts a rally first on home once it is made a favorite", async () => {
    const few = await saveRallyWithStamps("Few", 1);
    await saveRallyWithStamps("Many", 3);

    await renderRouter("./src/app");
    await screen.findByRole("button", { name: "View Many details" });
    expect(tileNames()).toEqual(["View Many details", "View Few details"]);

    await pressStarOnDetailAndReturn(few.id, "Remove from favorites");

    await waitFor(() =>
      expect(tileNames()).toEqual(["View Few details", "View Many details"]),
    );
  });

  test("returns a rally to its stamp-count place once the favorite is cleared", async () => {
    const few = await saveRallyWithStamps("Few", 1, true);
    await saveRallyWithStamps("Many", 3);
    await saveRallyWithStamps("None", 0);

    await renderRouter("./src/app");
    await screen.findByRole("button", { name: "View Few details" });
    expect(tileNames()).toEqual([
      "View Few details",
      "View Many details",
      "View None details",
    ]);

    await pressStarOnDetailAndReturn(few.id, "Add to favorites");

    await waitFor(() =>
      expect(tileNames()).toEqual([
        "View Many details",
        "View Few details",
        "View None details",
      ]),
    );
  });

  test("orders favorites by stamp count first, then the other rallies by stamp count", async () => {
    await saveRallyWithStamps("Plain many", 5);
    await saveRallyWithStamps("Favorite few", 1, true);
    await saveRallyWithStamps("Plain few", 2);
    await saveRallyWithStamps("Favorite many", 3, true);

    await renderRouter("./src/app");
    await screen.findByRole("button", { name: "View Plain many details" });

    expect(tileNames()).toEqual([
      "View Favorite many details",
      "View Favorite few details",
      "View Plain many details",
      "View Plain few details",
    ]);
  });

  test("marks only the favorite tiles", async () => {
    await saveRallyWithStamps("Marked", 1, true);
    await saveRallyWithStamps("Unmarked", 2);

    await renderRouter("./src/app");
    await screen.findByRole("button", { name: "View Marked details" });

    const [markedTile, unmarkedTile] = within(
      screen.getByTestId("rally-grid"),
    ).getAllByTestId("rally-tile");
    expect(within(markedTile).getByLabelText("Favorite")).toBeOnTheScreen();
    expect(
      within(unmarkedTile).queryByLabelText("Favorite"),
    ).not.toBeOnTheScreen();
  });
});

describe("S-039 T-002 ST-005 archived rallies leave home", () => {
  const daysAgo = (days: number) =>
    new Date(2026, 8, 20 - days, 12).toISOString();

  beforeEach(async () => {
    jest.setSystemTime(new Date(2026, 8, 20, 9, 0));
    await deleteAllRallies();
  });

  async function saveRallyWithStamps(name: string, stampCount: number) {
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
    return rally;
  }

  function gridTileNames() {
    return within(screen.getByTestId("rally-grid"))
      .queryAllByRole("button", { name: /^View .* details$/ })
      .map((tile) => tile.props.accessibilityLabel);
  }

  async function pressArchiveOnDetailAndReturn(rallyId: number, label: string) {
    await act(() => {
      router.push(`/rallies/${rallyId}`);
    });
    await fireEvent(
      await screen.findByTestId("rally-action-archive"),
      "buttonPress",
    );
    await waitFor(() => {
      expect(screen.getByTestId("rally-action-archive")).toHaveProp(
        "label",
        label,
      );
    });
    await act(() => {
      router.back();
    });
  }

  test("drops a rally from home once it is archived and brings it back to its place when unarchived", async () => {
    const middle = await saveRallyWithStamps("Middle", 2);
    await saveRallyWithStamps("Most", 3);
    await saveRallyWithStamps("Least", 1);

    await renderRouter("./src/app");
    await screen.findByRole("button", { name: "View Most details" });
    expect(gridTileNames()).toEqual([
      "View Most details",
      "View Middle details",
      "View Least details",
    ]);

    await pressArchiveOnDetailAndReturn(middle.id, "Unarchive rally");

    await waitFor(() =>
      expect(gridTileNames()).toEqual([
        "View Most details",
        "View Least details",
      ]),
    );

    await pressArchiveOnDetailAndReturn(middle.id, "Archive rally");

    await waitFor(() =>
      expect(gridTileNames()).toEqual([
        "View Most details",
        "View Middle details",
        "View Least details",
      ]),
    );
  });

  test("keeps Your Days and View All when every rally is archived", async () => {
    const only = await saveRallyWithStamps("Only one", 0);
    await ralliesDb.setRallyArchived({ id: only.id, isArchived: true });

    await renderRouter("./src/app");

    expect(
      await screen.findByRole("link", { name: "View All" }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("heading", { name: "Your Days" }),
    ).toBeOnTheScreen();
    expect(gridTileNames()).toEqual([]);
    expect(
      within(screen.getByTestId("rally-grid")).getByRole("link", {
        name: "Create rally",
      }),
    ).toBeOnTheScreen();
  });

  test("still shows an archived rally stamped today on the today card", async () => {
    const archived = await saveRallyWithStamps("Stamped then archived", 0);
    await stampsDb.saveStamp({
      rallyId: archived.id,
      stampedAt: new Date(2026, 8, 20, 8, 0).toISOString(),
    });
    await ralliesDb.setRallyArchived({ id: archived.id, isArchived: true });

    await renderRouter("./src/app");

    expect(
      await screen.findByLabelText(
        "Today, Sep 20, 1 stamp: Stamped then archived, 1 of 3",
      ),
    ).toBeOnTheScreen();
    expect(gridTileNames()).toEqual([]);
  });
});

describe("S-039 T-003 ST-003 View All tap target", () => {
  test("gives View All a tap target at least 44pt tall with body-size text", async () => {
    await renderHomeWithRally("View All size");

    const viewAll = screen.getByRole("link", { name: "View All" });
    expect(viewAll).toHaveProp(
      "className",
      expect.stringContaining("min-h-11"),
    );
    expect(within(viewAll).getByText("View All")).toHaveProp(
      "className",
      expect.stringContaining("text-base"),
    );
  });
});

describe("S-050 T-001 ST-002 full-screen gradient", () => {
  test("lays a top-to-bottom gradient behind the whole home screen", async () => {
    await renderHomeWithRally("Gradient check");

    const home = await screen.findByLabelText("Home");
    for (const name of [
      "bg-linear-to-b",
      "from-canvas-top",
      "via-canvas-mid",
      "to-canvas-bottom",
    ]) {
      expect(home).toHaveProp("className", expect.stringContaining(name));
    }
  });
});

describe("S-050 T-001 ST-003 orange only on today's stamp", () => {
  test("draws the today card and tiles as white surfaces with larger corners", async () => {
    await renderHomeWithRally("Corner check");

    const todayCard = screen.getByTestId("today-card");
    for (const name of ["bg-surface ", "rounded-[32px]"]) {
      expect(todayCard).toHaveProp("className", expect.stringContaining(name));
    }
    const tile = screen
      .getAllByTestId("rally-tile")
      .find((candidate) => within(candidate).queryByText("Corner check"));
    for (const name of ["rounded-[28px]", "p-4"]) {
      expect(tile).toHaveProp("className", expect.stringContaining(name));
    }
  });

  test("marks a rally stamped today in orange and its dots in the text color", async () => {
    const user = await renderHomeWithRally("Mark check");

    await user.press(
      screen.getByRole("button", { name: "Stamp Mark check for today" }),
    );

    expect(
      await screen.findByRole("button", {
        name: "Mark check already stamped today",
      }),
    ).toHaveProp("className", expect.stringContaining("bg-accent "));
    const tile = screen
      .getAllByTestId("rally-tile")
      .find((candidate) => within(candidate).queryByText("Mark check"));
    if (!tile) throw new Error("tile not found");
    for (const day of within(tile).getAllByTestId("activity-day")) {
      const dot = day.children[0];
      if (typeof dot === "string") continue;
      expect(dot).toHaveProp(
        "className",
        expect.not.stringContaining("bg-accent"),
      );
    }
  });
});

describe("S-050 T-003 ST-003 cards at the top of home", () => {
  const at = (month: number, day: number, hours = 12, minutes = 0) =>
    new Date(2026, month, day, hours, minutes).toISOString();

  beforeEach(async () => {
    jest.setSystemTime(new Date(2026, 9, 29, 20, 10));
    await deleteAllRallies();
  });

  async function saveRallyWithStamps(
    name: string,
    emoji: string,
    stampedAts: string[],
  ) {
    await ralliesDb.saveRally({ name, emoji });
    const rally = (await ralliesDb.listRallies()).find(
      (saved) => saved.name === name,
    );
    if (!rally) throw new Error(`rally ${name} not saved`);
    for (const stampedAt of stampedAts) {
      await stampsDb.saveStamp({ rallyId: rally.id, stampedAt });
    }
    return rally;
  }

  test("lays today, With Ato and today's log side by side and marks the one in view", async () => {
    await saveRallyWithStamps("Morning run", "🏃", [at(9, 29, 7, 12)]);

    await renderRouter("./src/app");
    const cards = await screen.findByTestId("top-cards");

    expect(cards).toHaveProp("horizontal", true);
    expect(
      within(cards)
        .getAllByTestId(/^(today-card|with-ato-card|today-log-card)$/)
        .map((card) => card.props.testID),
    ).toEqual(["today-card", "with-ato-card", "today-log-card"]);
    for (const card of within(cards).getAllByTestId(/-card$/)) {
      expect(card).toHaveProp("className", expect.stringContaining("h-42"));
      expect(card).toHaveProp(
        "className",
        expect.not.stringContaining("shadow"),
      );
    }
    const dotsInView = () =>
      screen
        .getAllByTestId("top-card-dot", { includeHiddenElements: true })
        .map((dot) => dot.props.className.includes("bg-foreground "));
    expect(dotsInView()).toEqual([true, false, false]);

    const { width } = screen.getByTestId("today-card").props.style;
    await fireEvent.scroll(cards, {
      nativeEvent: { contentOffset: { x: width + 10, y: 0 } },
    });

    expect(dotsInView()).toEqual([false, true, false]);
  });

  test("counts the days since the first stamp, every stamp and every rally on With Ato", async () => {
    await saveRallyWithStamps("Morning run", "🏃", [at(3, 3, 23), at(9, 28)]);
    const reading = await saveRallyWithStamps("Reading", "📚", [at(9, 1)]);
    await ralliesDb.setRallyArchived({ id: reading.id, isArchived: true });

    await renderRouter("./src/app");
    const card = await screen.findByTestId("with-ato-card");

    expect(within(card).getByText("since Apr 3, 2026")).toBeOnTheScreen();
    expect(within(card).getByText("210 days")).toBeOnTheScreen();
    expect(within(card).getByText("3 stamps")).toBeOnTheScreen();
    expect(within(card).getByText("2 rallies")).toBeOnTheScreen();
    // Home's tiles first, then the archived rally.
    expect(
      within(within(card).getByTestId("with-ato-emojis"))
        .getAllByText(/./)
        .map((t) => t.children[0]),
    ).toEqual(["🏃", "📚"]);
    expect(card).toHaveAccessibleName(
      "With Ato, 210 days since Apr 3, 2026, 3 stamps, 2 rallies, 2 of 3",
    );
  });

  test("shows 0 days on With Ato before the first stamp", async () => {
    await saveRallyWithStamps("Morning run", "🏃", []);

    await renderRouter("./src/app");
    const card = await screen.findByTestId("with-ato-card");

    expect(within(card).getByText("0 days")).toBeOnTheScreen();
    expect(within(card).queryByText(/^since/)).not.toBeOnTheScreen();
    expect(within(card).getByText("0 stamps")).toBeOnTheScreen();
    expect(within(card).getByText("1 rally")).toBeOnTheScreen();
  });

  test("puts each of today's stamps on the day's line and lists the latest three by time", async () => {
    await saveRallyWithStamps("Morning run", "🏃", [
      at(9, 29, 7, 12),
      at(9, 28, 9),
    ]);
    await saveRallyWithStamps("Reading", "📚", [at(9, 29, 12, 42)]);
    await saveRallyWithStamps("Walk", "🚶", [at(9, 29, 18, 40)]);
    await saveRallyWithStamps("Journal", "📓", [at(9, 29, 19, 6)]);

    await renderRouter("./src/app");
    const card = await screen.findByTestId("today-log-card");

    expect(within(card).getByText("now 8:10 PM")).toBeOnTheScreen();
    expect(within(card).getAllByTestId("today-log-dot")).toHaveLength(4);
    expect(within(card).getByTestId("today-log-now")).toHaveProp(
      "style",
      expect.objectContaining({ left: `${((20 + 10 / 60) / 24) * 100}%` }),
    );
    expect(
      within(within(card).getByTestId("today-log-times"))
        .getAllByText(/./)
        .map((t) => t.children[0]),
    ).toEqual(["+1", "📚 12:42 PM", "🚶 6:40 PM", "📓 7:06 PM"]);
    expect(card).toHaveAccessibleName(
      "Today's log, 4 stamps: 7:12 AM Morning run, 12:42 PM Reading, 6:40 PM Walk, 7:06 PM Journal, 3 of 3",
    );
  });

  test("leaves today's line empty with a hint before the first stamp of the day", async () => {
    await saveRallyWithStamps("Morning run", "🏃", [at(9, 28)]);

    await renderRouter("./src/app");
    const card = await screen.findByTestId("today-log-card");

    expect(within(card).queryByTestId("today-log-dot")).not.toBeOnTheScreen();
    expect(within(card).getByTestId("today-log-now")).toBeOnTheScreen();
    expect(
      within(card).getByText("Each stamp today lands on this line."),
    ).toBeOnTheScreen();
  });

  test("moves the time on today's log as the minutes pass", async () => {
    await saveRallyWithStamps("Morning run", "🏃", []);

    await renderRouter("./src/app");
    const card = await screen.findByTestId("today-log-card");
    expect(within(card).getByText("now 8:10 PM")).toBeOnTheScreen();

    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });

    expect(within(card).getByText("now 8:11 PM")).toBeOnTheScreen();
  });
});
