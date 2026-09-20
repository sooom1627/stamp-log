import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, screen } from "@testing-library/react-native";

import { formatHeaderDate } from "@/shared/utils/format-header-date";

jest.useFakeTimers();

describe("S-019 T-001 ST-002 tab root header", () => {
  test("shows today's date at the top of all three tabs", async () => {
    const today = formatHeaderDate(new Date());
    const app = renderRouter("./src/app");
    await app;

    expect(await screen.findAllByText(today)).toHaveLength(3);
    expect(screen.getAllByText(today)[0]).toHaveProp(
      "className",
      expect.stringContaining("mb-4"),
    );
    expect(
      screen.getByRole("link", { name: "Create rally" }),
    ).toBeOnTheScreen();

    await act(() => {
      router.push("/records");
    });
    expect(screen.getAllByText(today)).toHaveLength(3);
    expect(screen.getByText("No stamps yet")).toBeOnTheScreen();

    await act(() => {
      router.push("/calendar");
    });
    expect(screen.getAllByText(today)).toHaveLength(3);
    expect(screen.getByRole("heading", { name: "Calendar" })).toBeOnTheScreen();
  });
});
