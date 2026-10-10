import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, screen, waitFor, within } from "@testing-library/react-native";

import { listRallies, saveRally } from "@/features/rallies/db/rallies-db";
import * as stampsDb from "@/features/rallies/db/stamps-db";
import { saveStamp, updateStampMemo } from "@/features/rallies/db/stamps-db";

jest.useFakeTimers();

beforeEach(() => {
  jest.setSystemTime(new Date(2026, 8, 20, 15, 0));
});

afterEach(() => {
  jest.restoreAllMocks();
});

const at = (day: number, hours: number, minutes = 0) =>
  new Date(2026, 8, day, hours, minutes).toISOString();

async function saveRallyNamed(name: string, emoji: string) {
  await saveRally({ name, type: "place", emoji });
  const rally = (await listRallies()).find(
    (candidate) => candidate.name === name,
  );
  if (!rally) throw new Error(`Rally ${name} not found`);
  return rally;
}

async function openLogsDay(date: string) {
  await renderRouter("./src/app");
  expect(
    await screen.findByRole("link", { name: "Create rally" }),
  ).toBeOnTheScreen();
  await act(() => {
    router.push(`/logs-day?date=${date}`);
  });
}

describe("S-012 T-001 ST-002 Logs day sheet", () => {
  test("shows every rally's stamps of the day newest first with the rally name, time and memo", async () => {
    const cafe = await saveRallyNamed("Cafes", "☕");
    const lab = await saveRallyNamed("Researchers", "🔬");
    const latte = await saveStamp({
      rallyId: cafe.id,
      stampedAt: at(18, 16, 20),
    });
    await updateStampMemo({ id: latte.id, memo: "Crowded new place" });
    await saveStamp({ rallyId: lab.id, stampedAt: at(18, 13, 5) });
    // Other days stay out.
    await saveStamp({ rallyId: lab.id, stampedAt: at(17, 9) });
    await saveStamp({ rallyId: cafe.id, stampedAt: at(19, 0, 30) });

    await openLogsDay("2026-09-18");

    const sheet = within(await screen.findByTestId("logs-day-sheet"));
    expect(sheet.getByText("Friday")).toBeOnTheScreen();
    expect(
      sheet.getByRole("heading", { name: "Sep 18, 2026" }),
    ).toBeOnTheScreen();
    await waitFor(() => {
      expect(sheet.getAllByTestId(/^stamp-row-/)).toHaveLength(2);
    });
    expect(
      sheet
        .getAllByText(/^(Cafes|Researchers)$/)
        .map((name) => name.props.children),
    ).toEqual(["Cafes", "Researchers"]);
    expect(
      sheet.getAllByText(/ (AM|PM)$/).map((time) => time.props.children),
    ).toEqual(["4:20 PM", "1:05 PM"]);
    expect(sheet.getByText("Crowded new place")).toBeOnTheScreen();
    expect(sheet.getByText("no memo")).toBeOnTheScreen();
  });

  test("shows an error with Retry when the stamps cannot be read", async () => {
    jest
      .spyOn(stampsDb, "listStamps")
      .mockRejectedValue(new Error("disk full"));

    await openLogsDay("2026-09-18");

    const sheet = within(await screen.findByTestId("logs-day-sheet"));
    expect(await sheet.findByText("Couldn't load")).toBeOnTheScreen();
    expect(sheet.getByRole("button", { name: "Retry" })).toBeOnTheScreen();
  });
});
