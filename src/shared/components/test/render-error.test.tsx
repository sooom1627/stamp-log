import { render, screen, userEvent } from "@testing-library/react-native";

import { RenderError } from "../render-error";

jest.useFakeTimers();

describe("S-030 T-001 ST-002 RenderError", () => {
  test("says something went wrong without showing the error itself", async () => {
    await render(<RenderError retry={async () => {}} />);

    expect(screen.getByText("Something went wrong")).toBeOnTheScreen();
    expect(
      screen.getByText("This screen couldn't be shown."),
    ).toBeOnTheScreen();
  });

  test("calls retry when Try again is pressed", async () => {
    const retry = jest.fn(async () => {});
    const user = userEvent.setup();

    await render(<RenderError retry={retry} />);

    await user.press(screen.getByRole("button", { name: "Try again" }));

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
