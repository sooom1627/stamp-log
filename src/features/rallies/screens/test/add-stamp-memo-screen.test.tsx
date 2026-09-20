import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import {
  act,
  fireEvent,
  screen,
  userEvent,
} from "@testing-library/react-native";

import { listRallies, saveRally } from "../../db/rallies-db";
import { listStamps, saveStamp } from "../../db/stamps-db";

jest.useFakeTimers();

describe("S-024 T-001 ST-001 fit form sheet", () => {
  test("keeps Save inside intrinsically sized memo content", async () => {
    await renderRouter("./src/app", {
      initialUrl: "/add-stamp-memo?stampId=1",
    });

    const form = await screen.findByTestId("add-stamp-memo-form");

    expect(form).not.toHaveProp("className", expect.stringContaining("flex-1"));
    expect(screen.getByRole("button", { name: "Save" })).toBeOnTheScreen();
  });
});

describe("S-002 T-002 RT-003 ST-002 save memo", () => {
  test("persists memo on stamp after save", async () => {
    await saveRally({ name: "Memo save rally", type: "place" });
    const [rally] = await listRallies();
    const stamp = await saveStamp({ rallyId: rally.id });

    await renderRouter("./src/app");
    expect(await screen.findByText("Memo save rally")).toBeOnTheScreen();

    await act(() => {
      router.push(`/add-stamp-memo?stampId=${stamp.id}`);
    });

    const user = userEvent.setup();
    expect(await screen.findByText("Memo")).toBeOnTheScreen();
    expect(
      screen.queryByRole("heading", { name: "Add memo" }),
    ).not.toBeOnTheScreen();

    const memoInput = screen.getByPlaceholderText("Enter memo");
    await user.type(memoInput, "Met them");
    await act(async () => {
      fireEvent(memoInput, "submitEditing");
    });

    expect(
      await screen.findByRole("button", {
        name: "Memo save rally already stamped today",
      }),
    ).toBeDisabled();
    const [updated] = await listStamps();
    expect(updated.memo).toBe("Met them");
  });
});
