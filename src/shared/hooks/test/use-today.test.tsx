import { AppState, type AppStateStatus } from "react-native";

import { act, renderHook } from "@testing-library/react-native";

import { localDateKey } from "@/shared/utils/local-date-key";

import { useToday } from "../use-today";

// The OS tells the app it came back through AppState; the test plays the OS.
function captureAppStateListener() {
  const listeners: ((state: AppStateStatus) => void)[] = [];
  jest
    .spyOn(AppState, "addEventListener")
    .mockImplementation((_type, listener) => {
      listeners.push(listener);
      return { remove: jest.fn() };
    });
  return (state: AppStateStatus) =>
    listeners.forEach((listener) => listener(state));
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe("S-057 T-001 ST-002 useToday", () => {
  test("becomes the new day when local midnight passes while open", async () => {
    jest.setSystemTime(new Date(2026, 10, 1, 23, 59, 0));
    const { result } = await renderHook(() => useToday());
    expect(localDateKey(result.current)).toBe("2026-11-01");

    await act(async () => {
      jest.advanceTimersByTime(61_000);
    });

    expect(localDateKey(result.current)).toBe("2026-11-02");
  });

  test("becomes the new day when the app comes back on a later day", async () => {
    const emit = captureAppStateListener();
    jest.setSystemTime(new Date(2026, 10, 1, 22, 0, 0));
    const { result } = await renderHook(() => useToday());

    // The JS timers stop while iOS keeps the app in the background.
    jest.setSystemTime(new Date(2026, 10, 2, 8, 0, 0));
    await act(async () => {
      emit("active");
    });

    expect(localDateKey(result.current)).toBe("2026-11-02");
  });

  test("keeps the same value when the app comes back on the same day", async () => {
    const emit = captureAppStateListener();
    jest.setSystemTime(new Date(2026, 10, 1, 9, 0, 0));
    const { result } = await renderHook(() => useToday());
    const first = result.current;

    jest.setSystemTime(new Date(2026, 10, 1, 18, 0, 0));
    await act(async () => {
      emit("active");
    });

    expect(result.current).toBe(first);
  });

  test("keeps following midnights, day after day", async () => {
    jest.setSystemTime(new Date(2026, 10, 1, 23, 59, 0));
    const { result } = await renderHook(() => useToday());

    await act(async () => {
      jest.advanceTimersByTime(61_000);
    });
    await act(async () => {
      jest.advanceTimersByTime(24 * 60 * 60 * 1000);
    });

    expect(localDateKey(result.current)).toBe("2026-11-03");
  });
});
