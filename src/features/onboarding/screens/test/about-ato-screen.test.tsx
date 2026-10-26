import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, screen, userEvent } from "@testing-library/react-native";

import * as ralliesDb from "@/features/rallies/db/rallies-db";

jest.useFakeTimers();

async function openAboutAto() {
  await renderRouter("./src/app");
  await act(() => {
    router.push("/settings");
  });
  const user = userEvent.setup();
  await user.press(await screen.findByRole("button", { name: /About Ato/ }));
  return user;
}

describe("S-047 see the intro pages again from Settings", () => {
  test("opens the first intro page with Close instead of Skip", async () => {
    await openAboutAto();

    expect(
      await screen.findByRole("heading", {
        name: "Look back. It's all there.",
      }),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText("Page 1 of 4")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Close" })).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Skip" })).toBeNull();
  });

  test("goes back to Settings from Close", async () => {
    const user = await openAboutAto();

    await user.press(await screen.findByRole("button", { name: "Close" }));

    expect(
      await screen.findByRole("heading", { name: "Settings" }),
    ).toBeOnTheScreen();
    expect(screen.queryByLabelText("Page 1 of 4")).toBeNull();
  });

  test("ends with Done on the last page, without making a rally", async () => {
    const user = await openAboutAto();
    await screen.findByLabelText("Page 1 of 4");
    const before = await ralliesDb.listRallies();

    for (let page = 1; page < 4; page += 1) {
      await user.press(screen.getByRole("button", { name: "Next" }));
    }
    expect(screen.getByLabelText("Page 4 of 4")).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
    await user.press(screen.getByRole("button", { name: "Done" }));

    expect(
      await screen.findByRole("heading", { name: "Settings" }),
    ).toBeOnTheScreen();
    expect(
      screen.queryByRole("heading", { name: "What will you collect first?" }),
    ).toBeNull();
    expect(await ralliesDb.listRallies()).toEqual(before);
  });
});
