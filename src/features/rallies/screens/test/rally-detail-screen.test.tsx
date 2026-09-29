import { Alert, type AlertButton } from "react-native";

import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, screen, userEvent, waitFor } from "@testing-library/react-native";
import { toast } from "sonner-native";

import * as ralliesDb from "../../db/rallies-db";
import { listStamps, saveStamp } from "../../db/stamps-db";

jest.useFakeTimers();

beforeEach(() => {
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

function findAlertButton(style: AlertButton["style"]): AlertButton {
  const buttons = jest.mocked(Alert.alert).mock.calls.at(-1)?.[2] ?? [];
  const button = buttons.find((candidate) => candidate.style === style);
  if (!button) throw new Error(`Alert button with style ${style} not found`);
  return button;
}

async function openRallyDetail(name: string) {
  await ralliesDb.saveRally({ name, type: "place", emoji: "🗼" });
  const [rally] = await ralliesDb.listRallies();
  await saveStamp({ rallyId: rally.id });

  await renderRouter("./src/app");
  expect(await screen.findByText(name)).toBeOnTheScreen();
  await act(() => {
    router.push(`/rallies/${rally.id}`);
  });

  return { rally, user: userEvent.setup() };
}

describe("Rally detail", () => {
  test("shows the selected rally and its stamp count", async () => {
    await openRallyDetail("Tokyo towers");

    expect(await screen.findByLabelText("Rally detail")).toBeOnTheScreen();
    expect(screen.getByText("🗼")).toBeOnTheScreen();
    expect(
      screen.getByRole("heading", { name: "Tokyo towers" }),
    ).toBeOnTheScreen();
    expect(screen.getByText("1 stamp")).toBeOnTheScreen();
  });

  test("deletes the rally after confirmation and returns home", async () => {
    const { rally, user } = await openRallyDetail("Delete from detail");

    await user.press(
      await screen.findByRole("button", {
        name: "Delete Delete from detail",
      }),
    );
    expect(Alert.alert).toHaveBeenCalledTimes(1);

    await act(async () => {
      findAlertButton("destructive").onPress?.();
    });

    await waitFor(() => {
      expect(screen.queryByLabelText("Rally detail")).not.toBeOnTheScreen();
    });
    expect(
      (await ralliesDb.listRallies()).some(
        (candidate) => candidate.id === rally.id,
      ),
    ).toBe(false);
  });

  test("shows the global error toast when deletion fails", async () => {
    jest
      .spyOn(ralliesDb, "deleteRally")
      .mockRejectedValueOnce(new Error("delete failed"));
    const { user } = await openRallyDetail("Delete fails");

    await user.press(
      await screen.findByRole("button", { name: "Delete Delete fails" }),
    );
    await act(async () => {
      findAlertButton("destructive").onPress?.();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
      );
    });
    expect(screen.getByLabelText("Rally detail")).toBeOnTheScreen();
  });
});

describe("S-025 T-001 ST-006 past stamp entry", () => {
  test("opens the past stamp formSheet and returns with the new stamp counted", async () => {
    const { rally, user } = await openRallyDetail("Past stamp entry");
    expect(await screen.findByText("1 stamp")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Past stamp" }));

    expect(await screen.findByTestId("add-past-stamp-form")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("2 stamps")).toBeOnTheScreen();
    expect(screen.getByLabelText("Rally detail")).toBeOnTheScreen();
    expect(screen.queryByTestId("add-past-stamp-form")).not.toBeOnTheScreen();
    const stamps = (await listStamps()).filter(
      (stamp) => stamp.rallyId === rally.id,
    );
    expect(stamps).toHaveLength(2);
  });
});
