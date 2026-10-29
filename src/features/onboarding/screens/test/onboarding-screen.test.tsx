import { renderRouter } from "expo-router/testing-library";
import Storage from "expo-sqlite/kv-store";

import { fireEvent, screen, userEvent } from "@testing-library/react-native";

import * as ralliesDb from "@/shared/db/rallies-db";

import { hasOnboarded, markOnboarded } from "../../db/onboarding-state";

jest.useFakeTimers();

// Tests in this file share one in-memory database.
async function deleteAllRallies() {
  for (const rally of await ralliesDb.listRallies()) {
    await ralliesDb.deleteRally(rally.id);
  }
}

beforeEach(async () => {
  // A fresh install: never onboarded, no rallies.
  Storage.clearSync();
  await deleteAllRallies();
});

describe("S-047 T-001 ST-003 intro pages on first launch", () => {
  test("opens the first intro page instead of Home", async () => {
    await renderRouter("./src/app");

    expect(
      await screen.findByRole("heading", {
        name: "Look back. It's all there.",
      }),
    ).toBeOnTheScreen();
    expect(
      screen.getByText("No account. Everything stays on your phone."),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText("Page 1 of 4")).toBeOnTheScreen();
    expect(screen.queryByRole("link", { name: "Create rally" })).toBeNull();
  });

  test("moves through the four pages with Next and back with Back", async () => {
    await renderRouter("./src/app");
    const user = userEvent.setup();
    await screen.findByLabelText("Page 1 of 4");
    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();

    await user.press(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByLabelText("Page 2 of 4")).toBeOnTheScreen();
    expect(
      screen.getByRole("heading", {
        name: "Collect anything — people, places, moments",
      }),
    ).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Next" }));
    expect(
      screen.getByRole("heading", { name: "One tap. That's it." }),
    ).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Next" }));
    expect(
      screen.getByRole("heading", { name: "No streaks to keep." }),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText("Page 4 of 4")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText("Page 3 of 4")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Next" }));
    await user.press(screen.getByRole("button", { name: "Next" }));
    expect(
      screen.getByRole("heading", { name: "What will you collect first?" }),
    ).toBeOnTheScreen();
  });

  test("follows a swipe to another intro page", async () => {
    await renderRouter("./src/app");
    await screen.findByLabelText("Page 1 of 4");

    await fireEvent(screen.getByTestId("intro-pages"), "pageSelected", {
      nativeEvent: { position: 2 },
    });

    expect(screen.getByLabelText("Page 3 of 4")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Back" })).toBeOnTheScreen();
  });

  test("skips from any intro page to the first-rally choice", async () => {
    await renderRouter("./src/app");
    const user = userEvent.setup();
    await screen.findByLabelText("Page 1 of 4");
    await user.press(screen.getByRole("button", { name: "Next" }));

    await user.press(screen.getByRole("button", { name: "Skip" }));

    expect(
      screen.getByRole("heading", { name: "What will you collect first?" }),
    ).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Skip" })).toBeNull();
  });

  test("opens Home once onboarding is done", async () => {
    markOnboarded();

    await renderRouter("./src/app");

    expect(
      await screen.findByRole("link", { name: "Create rally" }),
    ).toBeOnTheScreen();
    expect(screen.queryByLabelText("Page 1 of 4")).toBeNull();
  });
});

describe("S-047 T-002 ST-001 pick the first rally", () => {
  async function openFirstRallyChoice() {
    await renderRouter("./src/app");
    const user = userEvent.setup();
    await user.press(await screen.findByRole("button", { name: "Skip" }));
    return user;
  }

  test("creates the chosen template and shows it on Home", async () => {
    const user = await openFirstRallyChoice();

    await user.press(
      screen.getByRole("button", { name: "☕ Cafés I visited" }),
    );
    await user.press(
      screen.getByRole("button", { name: "Start with Cafés I visited" }),
    );

    expect(await screen.findByText("Cafés I visited")).toBeOnTheScreen();
    expect(screen.getByText("Your Days")).toBeOnTheScreen();
    expect(await ralliesDb.listRallies()).toEqual([
      expect.objectContaining({ name: "Cafés I visited", emoji: "☕" }),
    ]);
    expect(hasOnboarded()).toBe(true);
  });

  test("chooses the template a swipe stops on", async () => {
    const user = await openFirstRallyChoice();

    await fireEvent(
      screen.getByTestId("first-rally-cards"),
      "momentumScrollEnd",
      {
        nativeEvent: { contentOffset: { x: 266, y: 0 } },
      },
    );

    expect(
      screen.getByRole("button", { name: "☕ Cafés I visited" }),
    ).toBeSelected();
    await user.press(
      screen.getByRole("button", { name: "Start with Cafés I visited" }),
    );
    expect(await screen.findByText("Cafés I visited")).toBeOnTheScreen();
  });

  test("starts with the first template selected", async () => {
    await openFirstRallyChoice();

    expect(
      screen.getByRole("button", { name: "🏃 Morning run" }),
    ).toBeSelected();
    expect(
      screen.getByRole("button", { name: "Start with Morning run" }),
    ).toBeOnTheScreen();
  });

  test("goes Home without a rally from I'll make my own", async () => {
    const user = await openFirstRallyChoice();

    await user.press(screen.getByRole("button", { name: "I'll make my own" }));

    expect(
      await screen.findByRole("link", { name: "Create rally" }),
    ).toBeOnTheScreen();
    expect(await ralliesDb.listRallies()).toEqual([]);
    expect(hasOnboarded()).toBe(true);
  });
});
