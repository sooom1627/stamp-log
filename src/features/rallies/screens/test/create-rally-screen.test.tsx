import { renderRouter } from "expo-router/testing-library";

import {
  act,
  fireEvent,
  screen,
  userEvent,
  within,
} from "@testing-library/react-native";

import * as ralliesDb from "../../db/rallies-db";

jest.mock("@softwhere-uz/react-native-emoji-keyboard");

jest.useFakeTimers();

afterEach(() => {
  jest.restoreAllMocks();
});

describe("S-024 T-001 ST-001 fit form sheet", () => {
  test("keeps Save inside intrinsically sized create content", async () => {
    await renderRouter("./src/app", { initialUrl: "/create-rally" });

    const form = await screen.findByTestId("create-rally-form");

    expect(form).not.toHaveProp("className", expect.stringContaining("flex-1"));
    expect(screen.getByRole("button", { name: "Save" })).toBeOnTheScreen();
  });
});

describe("S-002 T-002 RT-003 ST-002 save rally", () => {
  test("saves name and chosen emoji and shows emoji on home", async () => {
    await renderRouter("./src/app");

    const user = userEvent.setup();
    await user.press(await screen.findByRole("link", { name: "Create rally" }));

    await user.type(
      await screen.findByPlaceholderText("Enter a rally name"),
      "Kyoto trip",
    );

    expect(screen.getByDisplayValue("Kyoto trip")).toBeOnTheScreen();
    await user.press(
      screen.getByRole("button", { name: "Select emoji (currently ✨)" }),
    );
    expect(screen.getByTestId("emoji-picker")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Select 🔬" }));

    await user.press(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Kyoto trip")).toBeOnTheScreen();
    expect(screen.getByText("🔬")).toBeOnTheScreen();
  });

  test("hides color selector and closes picker when name field is focused", async () => {
    await renderRouter("./src/app", { initialUrl: "/create-rally" });
    const user = userEvent.setup();

    await user.press(
      await screen.findByRole("button", {
        name: "Select emoji (currently ✨)",
      }),
    );
    expect(screen.getByTestId("emoji-picker")).toBeOnTheScreen();
    expect(screen.queryByTestId("emoji-color-selector")).toBeNull();

    await act(async () => {
      fireEvent(screen.getByLabelText("Name"), "focus");
    });
    expect(screen.queryByTestId("emoji-picker")).toBeNull();
  });

  test("shows field labels and saves from Done", async () => {
    await renderRouter("./src/app");
    const user = userEvent.setup();
    await user.press(await screen.findByRole("link", { name: "Create rally" }));

    expect(await screen.findByText("Emoji")).toBeOnTheScreen();
    expect(screen.getByText("Name")).toBeOnTheScreen();

    const nameInput = screen.getByPlaceholderText("Enter a rally name");
    await user.type(nameInput, "Kamakura temples");
    await act(async () => {
      fireEvent(nameInput, "submitEditing");
    });

    expect(await screen.findByText("Kamakura temples")).toBeOnTheScreen();
  });

  test("shows saving state and disables save button while pending", async () => {
    jest
      .spyOn(ralliesDb, "saveRally")
      .mockImplementation(() => new Promise<void>(() => {}));
    await renderRouter("./src/app", { initialUrl: "/create-rally" });

    const user = userEvent.setup();
    await user.type(
      await screen.findByPlaceholderText("Enter a rally name"),
      "Saving rally",
    );
    await user.press(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Saving…")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
  });
});

describe("S-040 T-001 ST-002 create rally without type", () => {
  test("shows no type choice and starts with the default emoji", async () => {
    await renderRouter("./src/app", { initialUrl: "/create-rally" });

    expect(
      await screen.findByRole("button", {
        name: "Select emoji (currently ✨)",
      }),
    ).toBeOnTheScreen();
    expect(screen.queryByText("Type")).toBeNull();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });

  test("saves a rally with only a name and shows it with the default emoji on home", async () => {
    await renderRouter("./src/app");
    const user = userEvent.setup();
    await user.press(await screen.findByRole("link", { name: "Create rally" }));

    await user.type(
      await screen.findByPlaceholderText("Enter a rally name"),
      "Morning walks",
    );
    await user.press(screen.getByRole("button", { name: "Save" }));

    const tile = (await screen.findAllByTestId("rally-tile")).find(
      (candidate) => within(candidate).queryByText("Morning walks"),
    );
    if (!tile) throw new Error("Morning walks tile not found");
    expect(within(tile).getByText("✨")).toBeOnTheScreen();
  });
});

describe("S-002 T-002 RT-003 ST-002 name required", () => {
  test("cannot save when name is empty", async () => {
    await renderRouter("./src/app", { initialUrl: "/create-rally" });

    expect(await screen.findByRole("button", { name: "Save" })).toBeDisabled();
  });

  test("cannot save when name is whitespace only", async () => {
    await renderRouter("./src/app", { initialUrl: "/create-rally" });
    const user = userEvent.setup();
    await user.type(
      await screen.findByPlaceholderText("Enter a rally name"),
      "   ",
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
});
