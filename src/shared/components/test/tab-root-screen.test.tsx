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

  function expectDateHeader() {
    expect(largeTitles()).toEqual([
      "September 20",
      "September 20",
      "September 20",
    ]);
    expect(screen.getAllByText("Sunday")[0]).toHaveProp(
      "className",
      expect.stringContaining("mb-4"),
    );
  }

  test("shows the month and day as the title and today's weekday below it on all three tabs", async () => {
    await renderRouter("./src/app");

    expect(await screen.findAllByText("Sunday")).toHaveLength(3);
    expectDateHeader();
    expect(screen.queryByText(/Hello|Welcome back|Good morning/)).toBeNull();

    await act(() => {
      router.push("/records");
    });
    expectDateHeader();
    expect(screen.getByText("No stamps yet")).toBeOnTheScreen();

    await act(() => {
      router.push("/calendar");
    });
    expectDateHeader();
    expect(screen.getByRole("heading", { name: "Calendar" })).toBeOnTheScreen();
  });
});
