import { render, screen, userEvent } from "@testing-library/react-native";

import { Button } from "../button";

jest.useFakeTimers();

describe("S-006 RT-001 ST-001 Button", () => {
  test("shows no spinner when not loading", async () => {
    await render(<Button label="Save" onPress={() => {}} />);

    expect(screen.queryByTestId("button-spinner")).not.toBeOnTheScreen();
  });

  test("calls onPress when pressed", async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();

    await render(<Button label="Save" onPress={onPress} />);

    await user.press(screen.getByRole("button", { name: "Save" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test("does not call onPress when disabled", async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();

    await render(<Button label="Save" onPress={onPress} disabled />);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    await user.press(button);

    expect(onPress).not.toHaveBeenCalled();
  });

  test("shows a spinner with the label and is busy and disabled while loading", async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();

    await render(<Button label="Saving…" onPress={onPress} isLoading />);

    const button = screen.getByRole("button", { name: "Saving…" });
    expect(button).toBeDisabled();
    expect(button).toBeBusy();
    expect(screen.getByText("Saving…")).toBeOnTheScreen();
    expect(screen.getByTestId("button-spinner")).toBeOnTheScreen();
    await user.press(button);

    expect(onPress).not.toHaveBeenCalled();
  });

  test("uses aria-label as the accessible name when given", async () => {
    await render(
      <Button
        label="Delete rally"
        aria-label="Delete Walks"
        variant="danger"
        onPress={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Delete Walks" }),
    ).toBeOnTheScreen();
    expect(screen.getByText("Delete rally")).toBeOnTheScreen();
  });

  test("sizes every variant like Save and appends the outer className", async () => {
    await render(
      <>
        <Button label="Save" onPress={() => {}} className="mt-8" />
        <Button label="Delete rally" variant="danger" onPress={() => {}} />
      </>,
    );

    const save = screen.getByRole("button", { name: "Save" });
    const remove = screen.getByRole("button", { name: "Delete rally" });
    for (const button of [save, remove]) {
      expect(button).toHaveProp(
        "className",
        expect.stringContaining("rounded-2xl py-4"),
      );
    }
    expect(save).toHaveProp("className", expect.stringContaining("mt-8"));
    expect(save).toHaveProp("className", expect.stringContaining("bg-main"));
    expect(remove).toHaveProp(
      "className",
      expect.stringContaining("border-danger"),
    );
    expect(screen.getByText("Save")).toHaveProp(
      "className",
      expect.stringContaining("text-base"),
    );
  });
});
