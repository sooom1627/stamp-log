import { Text } from "react-native";

import { renderRouter } from "expo-router/testing-library";

import { screen, userEvent } from "@testing-library/react-native";

jest.useFakeTimers();

let shouldThrow = true;

function ThrowingRoute() {
  if (shouldThrow) {
    throw new Error("render failed");
  }
  return <Text>Rendered again</Text>;
}

describe("S-030 T-001 ST-003 root ErrorBoundary", () => {
  beforeEach(() => {
    jest.setSystemTime(new Date(2026, 8, 20, 9, 0));
    shouldThrow = true;
    // React logs every caught render error.
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("shows the message and Try again when a route throws while rendering", async () => {
    await renderRouter(
      { appDir: "./src/app", overrides: { boom: ThrowingRoute } },
      { initialUrl: "/boom" },
    );

    expect(await screen.findByText("Something went wrong")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Try again" })).toBeOnTheScreen();
  });

  test("renders the route again when Try again is pressed", async () => {
    const user = userEvent.setup();
    await renderRouter(
      { appDir: "./src/app", overrides: { boom: ThrowingRoute } },
      { initialUrl: "/boom" },
    );
    await screen.findByText("Something went wrong");

    shouldThrow = false;
    await user.press(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Rendered again")).toBeOnTheScreen();
    expect(screen.queryByText("Something went wrong")).not.toBeOnTheScreen();
  });

  test("shows the screen as before when nothing throws", async () => {
    await renderRouter("./src/app");

    expect(await screen.findByText("Sunday")).toBeOnTheScreen();
    expect(screen.queryByText("Something went wrong")).not.toBeOnTheScreen();
  });
});
