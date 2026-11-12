import { renderRouter } from "expo-router/testing-library";

import { screen, userEvent, within } from "@testing-library/react-native";

import * as ralliesDb from "@/shared/db/rallies-db";
import { saveStamp } from "@/shared/db/stamps-db";
import { deleteAllRallies } from "@/shared/utils/test-helpers/delete-all-rallies";
import { offScaleClassNames } from "@/shared/utils/test-helpers/design-rules";

jest.useFakeTimers();

beforeEach(async () => {
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

async function openHome() {
  const app = await renderRouter("./src/app");
  const cards = within(await screen.findByTestId("top-cards"));
  await cards.findByTestId("with-ato-card");
  return { app, cards };
}

function cardIds(cards: ReturnType<typeof within>) {
  return cards
    .getAllByTestId(/^(today|last-month|today-log|with-ato)-card$/)
    .map((card) => card.props.testID);
}

describe("S-058 T-003 ST-006 last month card on home", () => {
  test("in the first 7 days, shows last month second with its counts and grid", async () => {
    jest.setSystemTime(new Date(2026, 10, 7, 21));
    await saveRally("行ったカフェ", "☕", [
      new Date(2026, 9, 2, 9),
      new Date(2026, 9, 31, 9),
    ]);
    await saveRally("読んだ本", "📚", [new Date(2026, 9, 5, 9)]);

    const { cards } = await openHome();

    expect(cardIds(cards)).toEqual([
      "today-card",
      "last-month-card",
      "today-log-card",
      "with-ato-card",
    ]);
    const card = within(cards.getByTestId("last-month-card"));
    expect(card.getByText("October")).toBeOnTheScreen();
    expect(card.getByText("last month")).toBeOnTheScreen();
    expect(card.getByText("3 stamps")).toBeOnTheScreen();
    expect(card.getByText("2 rallies")).toBeOnTheScreen();
    // The grid is a picture of the counts beside it, so VoiceOver skips it.
    expect(
      card.getAllByTestId("month-grid-row", { includeHiddenElements: true }),
    ).toHaveLength(2);
    expect(offScaleClassNames(cards.getByTestId("last-month-card"))).toEqual(
      [],
    );
    expect(
      screen.getAllByTestId("top-card-dot", { includeHiddenElements: true }),
    ).toHaveLength(4);
  });

  test("Share opens the share sheet with last month", async () => {
    jest.setSystemTime(new Date(2026, 10, 1, 9));
    await saveRally("送る先月", "🏃", [new Date(2026, 9, 20, 9)]);
    const { app, cards } = await openHome();

    await userEvent.setup().press(
      within(cards.getByTestId("last-month-card")).getByRole("button", {
        name: "Share image",
      }),
    );

    expect(await screen.findByTestId("share-month-sheet")).toBeOnTheScreen();
    expect(app.getSearchParams()).toEqual({ month: "2026-10" });
  });

  test("is not shown from the 8th", async () => {
    jest.setSystemTime(new Date(2026, 10, 8, 9));
    await saveRally("八日", "☕", [new Date(2026, 9, 20, 9)]);

    const { cards } = await openHome();

    expect(cardIds(cards)).toEqual([
      "today-card",
      "today-log-card",
      "with-ato-card",
    ]);
  });

  test("is not shown when last month has no stamps", async () => {
    jest.setSystemTime(new Date(2026, 10, 3, 9));
    await saveRally("先々月だけ", "☕", [new Date(2026, 8, 20, 9)]);

    const { cards } = await openHome();

    expect(cards.queryByTestId("last-month-card")).toBeNull();
  });
});
