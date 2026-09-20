import { renderRouter } from "expo-router/testing-library";

import {
  act,
  fireEvent,
  screen,
  userEvent,
} from "@testing-library/react-native";

import * as ralliesDb from "../../db/rallies-db";

jest.mock("@softwhere-uz/react-native-emoji-keyboard");

jest.useFakeTimers();

afterEach(() => {
  jest.restoreAllMocks();
});

describe("S-002 T-002 RT-003 ST-002 save rally", () => {
  test("saves name, type, and chosen emoji and shows emoji on home", async () => {
    await renderRouter("./src/app");

    const user = userEvent.setup();
    await user.press(screen.getByRole("link", { name: "Create rally" }));

    await user.type(
      await screen.findByPlaceholderText("Enter a place to track"),
      "Kyoto trip",
    );
    await user.press(screen.getByRole("radio", { name: "Person" }));

    expect(screen.getByDisplayValue("Kyoto trip")).toBeOnTheScreen();
    expect(
      screen.getByPlaceholderText("Enter a person to track"),
    ).toBeOnTheScreen();
    await user.press(
      screen.getByRole("button", { name: "Select emoji (currently 😀)" }),
    );
    expect(screen.getByTestId("emoji-picker")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Select 🔬" }));

    await user.press(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Kyoto trip")).toBeOnTheScreen();
    expect(screen.getByText("🔬")).toBeOnTheScreen();
    expect(screen.queryByText("Person")).toBeNull();
    expect(screen.queryByLabelText("Person")).toBeNull();
  });

  test("follows type default emoji until customized, then keeps custom emoji", async () => {
    await renderRouter("./src/app", { initialUrl: "/create-rally" });
    const user = userEvent.setup();

    expect(
      await screen.findByRole("button", {
        name: "Select emoji (currently 🏠)",
      }),
    ).toBeOnTheScreen();

    await user.press(screen.getByRole("radio", { name: "Person" }));
    await user.press(
      screen.getByRole("button", { name: "Select emoji (currently 😀)" }),
    );
    await user.press(screen.getByRole("button", { name: "Select 🎯" }));
    await user.press(screen.getByRole("radio", { name: "Action" }));
    expect(
      screen.getByRole("button", { name: "Select emoji (currently 🎯)" }),
    ).toBeOnTheScreen();
  });

  test("hides color selector and closes picker when name field is focused", async () => {
    await renderRouter("./src/app", { initialUrl: "/create-rally" });
    const user = userEvent.setup();

    await user.press(
      await screen.findByRole("button", {
        name: "Select emoji (currently 🏠)",
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
    await user.press(screen.getByRole("link", { name: "Create rally" }));

    expect(await screen.findByText("Type")).toBeOnTheScreen();
    expect(screen.getByText("Name")).toBeOnTheScreen();

    const nameInput = screen.getByPlaceholderText("Enter a place to track");
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
      await screen.findByPlaceholderText("Enter a place to track"),
      "Saving rally",
    );
    await user.press(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Saving…")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
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
      await screen.findByPlaceholderText("Enter a place to track"),
      "   ",
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
});
