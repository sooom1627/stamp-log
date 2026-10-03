import { render, screen, userEvent } from "@testing-library/react-native";

import { Button } from "../button";

jest.useFakeTimers();

describe("S-006 RT-001 ST-001 Button", () => {
  test("shows the label and calls onPress when pressed", async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<Button label="Save" onPress={onPress} />);

    await user.press(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Save")).toBeOnTheScreen();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test("does not call onPress while disabled", async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<Button label="Save" onPress={onPress} disabled />);

    const button = screen.getByRole("button", { name: "Save" });
    await user.press(button);

    expect(button).toBeDisabled();
    expect(onPress).not.toHaveBeenCalled();
  });

  test("shows a spinner with the label and reports busy while loading", async () => {
    await render(
      <Button label="Saving…" onPress={() => {}} disabled isLoading />,
    );

    const button = screen.getByRole("button", { name: "Saving…" });
    expect(button).toBeDisabled();
    expect(button).toBeBusy();
    expect(screen.getByText("Saving…")).toBeOnTheScreen();
    expect(screen.getByTestId("button-spinner")).toBeOnTheScreen();
  });

  test("does not show a spinner when not loading", async () => {
    await render(<Button label="Save" onPress={() => {}} />);

    expect(screen.queryByTestId("button-spinner")).toBeNull();
  });

  test("uses aria-label as the accessible name when given", async () => {
    await render(
      <Button
        label="Delete rally"
        variant="danger"
        aria-label="Delete Kyoto trip"
        onPress={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Delete Kyoto trip" }),
    ).toBeOnTheScreen();
    expect(screen.getByText("Delete rally")).toBeOnTheScreen();
  });
});
