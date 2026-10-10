import { Text } from "react-native";

import { render, screen, within } from "@testing-library/react-native";

import { FormSheetLayout } from "../form-sheet";

// Host scroll views in the rendered tree.
function scrollViews() {
  return screen.container.queryAll(
    (instance) => instance.type === "RCTScrollView",
  );
}

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

  test("S-012 scrolls the content under a sticky heading when scrollable", async () => {
    await render(
      <FormSheetLayout testID="sheet" title="Sep 18, 2026" scrollable>
        <Text>Body</Text>
      </FormSheetLayout>,
    );

    // react-native-screens sizes the first scroll view to the whole sheet.
    // The heading is its sticky first child, so only the content scrolls.
    const [scrollView] = scrollViews();
    expect(scrollView).toHaveProp("testID", "sheet");
    expect(scrollView).toHaveProp("stickyHeaderIndices", [0]);
    const heading = within(scrollView).getByTestId("sheet-heading");
    expect(heading).toHaveProp("className", expect.stringContaining("pt-8"));
    expect(
      within(heading).getByRole("heading", { name: "Sep 18, 2026" }),
    ).toBeOnTheScreen();
    expect(within(scrollView).getByText("Body")).toBeOnTheScreen();
  });

  test("S-012 uses no scroll view by default", async () => {
    await render(
      <FormSheetLayout title="Edit stamp">
        <Text>Body</Text>
      </FormSheetLayout>,
    );

    expect(scrollViews()).toHaveLength(0);
  });
});
