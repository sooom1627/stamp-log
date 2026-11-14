import * as SplashScreen from "expo-splash-screen";

import { act, renderHook } from "@testing-library/react-native";

import { useHideSplashAfter } from "../use-hide-splash-after";

// The splash screen is native; only its hide call is observed here.
jest.mock("expo-splash-screen", () => ({
  hideAsync: jest.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

describe("useHideSplashAfter", () => {
  test("keeps the splash screen until the time has passed", async () => {
    const { hideAsync } = SplashScreen;

    await renderHook(() => useHideSplashAfter(1500));

    await act(async () => {
      jest.advanceTimersByTime(1499);
    });
    expect(hideAsync).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(hideAsync).toHaveBeenCalledTimes(1);
  });
});
