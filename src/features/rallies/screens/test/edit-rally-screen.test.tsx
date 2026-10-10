import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, screen, userEvent, waitFor } from "@testing-library/react-native";
import { toast } from "sonner-native";

import * as ralliesDb from "../../db/rallies-db";

jest.mock("@softwhere-uz/react-native-emoji-keyboard");

jest.useFakeTimers();

afterEach(() => {
  jest.restoreAllMocks();
});

async function openEditRally(name: string) {
  await ralliesDb.saveRally({ name, emoji: "🗼" });
  const rally = (await ralliesDb.listRallies()).find(
    (candidate) => candidate.name === name,
  );
  if (!rally) throw new Error(`Rally ${name} not found`);

  const app = renderRouter("./src/app");
  await app;
  expect(
    await screen.findByRole("button", { name: `View ${name} details` }),
  ).toBeOnTheScreen();
  await act(() => {
    router.push({ pathname: "/edit-rally", params: { rallyId: rally.id } });
  });
  expect(await screen.findByTestId("edit-rally-form")).toBeOnTheScreen();

  return { app, rally, user: userEvent.setup() };
}

async function findRally(id: number) {
  return (await ralliesDb.listRallies()).find((rally) => rally.id === id);
}

describe("S-013 T-001 ST-004 edit rally sheet", () => {
  test("opens with the rally's current emoji and name and no type choice", async () => {
    await openEditRally("Tokyo towers");

    expect(
      screen.getByRole("heading", { name: "Edit rally" }),
    ).toBeOnTheScreen();
    expect(screen.queryByText("Type")).toBeNull();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(
      screen.getByRole("button", { name: "Select emoji (currently 🗼)" }),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText("Name")).toHaveDisplayValue("Tokyo towers");
  });

  test("saves the new name and emoji, closes and shows them on home", async () => {
    const { app, rally, user } = await openEditRally("Before rename");

    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "After rename");
    await user.press(
      screen.getByRole("button", { name: "Select emoji (currently 🗼)" }),
    );
    await user.press(screen.getByRole("button", { name: "Select 🔬" }));
    await user.press(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByRole("button", { name: "View After rename details" }),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId("edit-rally-form")).not.toBeOnTheScreen();
    expect(app.getPathname()).toBe("/");
    await expect(findRally(rally.id)).resolves.toEqual({
      id: rally.id,
      name: "After rename",
      emoji: "🔬",
      isFavorite: false,
      isArchived: false,
    });
  });

  test.each(["", "   "])("cannot save when the name is %p", async (name) => {
    const { user } = await openEditRally(`Blank name ${name.length}`);

    await user.clear(screen.getByLabelText("Name"));
    if (name) await user.type(screen.getByLabelText("Name"), name);

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  test("shows the global error toast and stays when saving fails", async () => {
    jest
      .spyOn(ralliesDb, "updateRally")
      .mockRejectedValueOnce(new Error("update failed"));
    const { rally, user } = await openEditRally("Update fails");

    await user.type(screen.getByLabelText("Name"), " again");
    await user.press(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
      );
    });
    expect(screen.getByTestId("edit-rally-form")).toBeOnTheScreen();
    await expect(findRally(rally.id)).resolves.toEqual(rally);
  });

  test("closes when the rally does not exist", async () => {
    const app = renderRouter("./src/app");
    await app;

    await act(() => {
      router.push({ pathname: "/edit-rally", params: { rallyId: 99999 } });
    });

    await waitFor(() => {
      expect(app.getPathname()).toBe("/");
    });
    expect(screen.queryByTestId("edit-rally-form")).not.toBeOnTheScreen();
  });
});
