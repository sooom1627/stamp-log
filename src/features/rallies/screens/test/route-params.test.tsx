import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, waitFor } from "@testing-library/react-native";

jest.useFakeTimers();

describe("S-006 RT-003 ST-002 invalid id URL params close the screen", () => {
  test.each([
    ["/add-stamp-memo?stampId=abc"],
    ["/edit-stamp?stampId=0"],
    ["/edit-rally?rallyId=abc"],
    ["/add-past-stamp?rallyId=-1"],
    ["/add-past-stamp"],
    ["/add-past-stamp?rallyId=1&date=2026-02-30"],
    ["/rallies/1.5"],
    ["/rally-day?rallyId=1&date=2026-02-30"],
    ["/rally-day?rallyId=1"],
    ["/rally-day?date=2026-09-18"],
    ["/logs-day?date=2026-02-30"],
    ["/logs-day?date=2999-01-01"],
    ["/logs-day"],
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

describe("RT-001 ST-003 ids of records that do not exist close the screen", () => {
  test.each([
    ["/edit-stamp?stampId=999999"],
    ["/add-stamp-memo?stampId=999999"],
    ["/add-past-stamp?rallyId=999999"],
    ["/rally-day?rallyId=999999&date=2020-01-01"],
    ["/edit-rally?rallyId=999999"],
    ["/rallies/999999"],
  ] as const)("%s goes back home", async (href) => {
    const app = renderRouter("./src/app");
    await app;

    await act(() => {
      router.push(href);
    });

    await waitFor(() => {
      expect(app.getPathname()).toBe("/");
    });
  });
});
