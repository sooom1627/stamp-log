import { render, screen } from "@testing-library/react-native";

import { type Rally } from "../../schemas/rallies";
import { type Stamp } from "../../schemas/stamps";
import { CollectionSummary } from "../collection-summary.tsx";

jest.useFakeTimers();

const rallies: Rally[] = [
  { id: 1, name: "Person", type: "person", emoji: "👤" },
  { id: 2, name: "Place", type: "place", emoji: "🏠" },
  { id: 3, name: "Action", type: "action", emoji: "👍" },
];

const stamps: Stamp[] = [
  { id: 1, rallyId: 1, stampedAt: "2026-09-01T03:00:00.000Z", memo: null },
  { id: 2, rallyId: 1, stampedAt: "2026-08-01T03:00:00.000Z", memo: null },
  { id: 3, rallyId: 2, stampedAt: "2026-09-19T03:00:00.000Z", memo: null },
  { id: 4, rallyId: 2, stampedAt: "2026-09-20T03:00:00.000Z", memo: null },
  { id: 5, rallyId: 3, stampedAt: "2026-08-20T03:00:00.000Z", memo: null },
];

describe("S-020 T-004 ST-001 CollectionSummary", () => {
  test("累計、今月、タイプ別件数と構成比バーが分かる", async () => {
    jest.setSystemTime(new Date("2026-09-20T03:00:00.000Z"));

    await render(<CollectionSummary rallies={rallies} stamps={stamps} />);

    expect(screen.getByText("5")).toBeOnTheScreen();
    expect(screen.getByText("STAMPS")).toBeOnTheScreen();
    expect(screen.getByText("This month + 3")).toBeOnTheScreen();
    expect(
      screen.getByLabelText("累計5個、今月3個、人2個、場所2個、行動1個"),
    ).toBeOnTheScreen();
    expect(screen.getAllByTestId("collection-segment")).toHaveLength(3);
  });

  test("スタンプがないときは0件と淡色のバーが出る", async () => {
    jest.setSystemTime(new Date("2026-09-20T03:00:00.000Z"));

    await render(<CollectionSummary rallies={[]} stamps={[]} />);

    expect(
      screen.getByLabelText("累計0個、今月0個、人0個、場所0個、行動0個"),
    ).toBeOnTheScreen();
    expect(screen.getByText("This month + 0")).toBeOnTheScreen();
    expect(screen.getByTestId("collection-empty-track")).toBeOnTheScreen();
    expect(screen.queryAllByTestId("collection-segment")).toHaveLength(0);
  });
});
