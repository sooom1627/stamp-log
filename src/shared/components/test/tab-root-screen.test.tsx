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
  // The scroll view (a FlatList on Logs) is the tab's whole background.
  function tabBackgrounds() {
    return screen.container
      .queryAll((instance) => instance.type === "RCTScrollView")
      .map((instance) => instance.props.className);
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
