import { Text } from "react-native";

import { render, screen } from "@testing-library/react-native";

import { FormSheetLayout } from "../form-sheet";

describe("S-028 RT-002 ST-001 FormSheetLayout", () => {
  // Rendered without a navigator: the layout must not read the header height.
  test("shows the eyebrow above a heading and the content", async () => {
    await render(
      <FormSheetLayout
        testID="sheet"
        eyebrow="🗼 Researchers"
        title="Edit stamp"
      >
        <Text>Body</Text>
      </FormSheetLayout>,
    );

    expect(
      screen.getByRole("heading", { name: "Edit stamp" }),
    ).toBeOnTheScreen();
    expect(screen.getByText("🗼 Researchers")).toBeOnTheScreen();
    expect(screen.getByText("Body")).toBeOnTheScreen();
    expect(screen.getByTestId("sheet")).toBeOnTheScreen();
  });

  test("omits the eyebrow when none is given", async () => {
    await render(
      <FormSheetLayout title="Create rally">
        <Text>Body</Text>
      </FormSheetLayout>,
    );

    expect(
      screen.getByRole("heading", { name: "Create rally" }),
    ).toBeOnTheScreen();
    expect(screen.getAllByText(/./)).toHaveLength(2);
  });
});
