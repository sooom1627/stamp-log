import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act } from "@testing-library/react-native";

jest.useFakeTimers();

describe("S-006 RT-003 ST-002 invalid id URL params close the screen", () => {
  test.each([
    ["/add-stamp-memo?stampId=abc"],
    ["/edit-stamp?stampId=0"],
    ["/add-past-stamp?rallyId=-1"],
    ["/add-past-stamp"],
    ["/rallies/1.5"],
    ["/rally-day?rallyId=1&date=2026-02-30"],
    ["/rally-day?rallyId=1"],
    ["/rally-day?date=2026-09-18"],
  ] as const)("%s goes back home", async (href) => {
    // renderRouter attaches getPathname to the returned promise itself.
    const app = renderRouter("./src/app");
    await app;
    expect(app.getPathname()).toBe("/");

    await act(() => {
      router.push(href);
    });

    expect(app.getPathname()).toBe("/");
  });
});
