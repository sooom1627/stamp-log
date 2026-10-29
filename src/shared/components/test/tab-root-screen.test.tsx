import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, screen } from "@testing-library/react-native";

jest.useFakeTimers();

describe("S-029 T-001 ST-006 tab root header", () => {
  beforeEach(() => {
    jest.setSystemTime(new Date(2026, 8, 20, 9, 0));
  });

  // The large title is a native header prop, not text in the tree.
  function largeTitles() {
    return screen.container
      .queryAll((instance) => instance.type === "RNSScreenStackHeaderConfig")
      .map((instance) => instance.props.title)
      .filter((title) => title !== "(tabs)");
  }

  test("shows the month and day as the title and today's weekday below it on Home", async () => {
    await renderRouter("./src/app");

    expect(await screen.findByText("Sunday")).toHaveProp(
      "className",
      expect.stringContaining("mb-4"),
    );
    expect(largeTitles()).toContain("September 20");
    expect(screen.queryByText(/Hello|Welcome back|Good morning/)).toBeNull();
  });
});

describe("S-011 Logs title", () => {
  beforeEach(() => {
    jest.setSystemTime(new Date(2026, 8, 20, 9, 0));
  });

  function largeTitles() {
    return screen.container
      .queryAll((instance) => instance.type === "RNSScreenStackHeaderConfig")
      .map((instance) => instance.props.title)
      .filter((title) => title !== "(tabs)");
  }

  test("titles Logs with Logs and a short line instead of the date", async () => {
    await renderRouter("./src/app");
    await screen.findByText("Sunday");

    await act(() => {
      router.push("/records");
    });

    expect(largeTitles()).toEqual(["September 20", "Logs"]);
    expect(screen.getByLabelText("Logs timeline")).toBeOnTheScreen();
    expect(screen.getAllByText("Sunday")).toHaveLength(1);
    expect(screen.getByText("Your days, one stamp at a time")).toHaveProp(
      "className",
      expect.stringContaining("mb-4"),
    );
  });
});

describe("S-033 T-001 ST-001 tab root background", () => {
  // The root fills the tab: Home's scroll view, and on Logs the view that
  // holds the fixed top and the pages (S-043).
  function tabBackgrounds() {
    return [
      screen.getByLabelText("Home"),
      screen.getByLabelText("Logs timeline"),
    ].map((root) => root.props.className);
  }

  test("paints both tabs with the canvas color, not the plain background", async () => {
    await renderRouter("./src/app");

    await screen.findByText("Sunday");
    const backgrounds = tabBackgrounds();
    expect(backgrounds).toHaveLength(2);
    for (const className of backgrounds) {
      expect(className).toEqual(expect.stringContaining("bg-canvas"));
      expect(className).not.toEqual(expect.stringContaining("bg-background"));
    }
  });
});

describe("S-050 T-002 ST-002 tab root gradient", () => {
  test("lays the same top-to-bottom gradient behind Home and Logs", async () => {
    await renderRouter("./src/app");

    await screen.findByLabelText("Home");
    const backgrounds = [
      screen.getByLabelText("Home"),
      screen.getByLabelText("Logs timeline"),
    ].map((root) => root.props.className);
    for (const className of backgrounds) {
      for (const name of [
        "bg-linear-to-b",
        "from-canvas-top",
        "via-canvas-mid",
        "to-canvas-bottom",
      ]) {
        expect(className).toEqual(expect.stringContaining(name));
      }
    }
  });
});

describe("S-049 T-002 ST-002 header logo", () => {
  beforeEach(() => {
    jest.setSystemTime(new Date(2026, 8, 20, 9, 0));
  });

  test("shows the Ato mark at the left of the tab root header", async () => {
    await renderRouter("./src/app");

    await screen.findByText("Sunday");

    // Header subviews sit outside the accessible tree in tests, and native
    // tabs keep both tab roots (and their headers) mounted.
    expect(
      screen.getAllByLabelText("Ato", { includeHiddenElements: true })[0],
    ).toBeOnTheScreen();
  });
});
