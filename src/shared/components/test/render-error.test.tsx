import { render, screen, userEvent } from "@testing-library/react-native";

import { offScaleClassNames } from "@/shared/utils/test-helpers/design-rules";

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

describe("S-060 T-003 ST-002 RenderError follows DESIGN.md", () => {
  test("keeps the 20 sides and the type on the scales", async () => {
    await render(<RenderError retry={async () => {}} />);

    const title = screen.getByText("Something went wrong");
    expect(title).toHaveProp(
      "className",
      expect.stringContaining("text-title2"),
    );
    const page = title.parent?.parent;
    if (!page) throw new Error("The error page is missing");
    expect(offScaleClassNames(page)).toEqual([]);
    expect(page).toHaveProp(
      "className",
      expect.stringMatching(/(^|\s)px-5(\s|$)/),
    );
  });
});
