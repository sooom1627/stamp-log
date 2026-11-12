import { PixelRatio } from "react-native";

import { shareAsync } from "expo-sharing";

import { act, renderHook } from "@testing-library/react-native";
import { captureRef } from "react-native-view-shot";

import {
  clearQueryClients,
  createWrapper,
} from "@/shared/utils/test-helpers/query-wrapper";

import { useShareImage } from "../use-share-image";

beforeEach(() => {
  jest.mocked(captureRef).mockClear();
  jest.mocked(shareAsync).mockClear();
});

afterEach(() => {
  clearQueryClients();
});

describe("S-058 T-001 ST-003 share image hook", () => {
  test("captures the view as a 1080 × 1350 png and opens the share sheet with it", async () => {
    const view = { current: null };
    const { result } = await renderHook(() => useShareImage(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync(view);
    });

    expect(captureRef).toHaveBeenCalledTimes(1);
    const [capturedView, options] = jest.mocked(captureRef).mock.calls[0];
    expect(capturedView).toBe(view);
    expect(options).toEqual({
      format: "png",
      result: "tmpfile",
      width: 1080 / PixelRatio.get(),
      height: 1350 / PixelRatio.get(),
    });
    expect(shareAsync).toHaveBeenCalledWith("file:///tmp/share-image.png", {
      mimeType: "image/png",
      UTI: "public.png",
    });
  });

  test("does not open the share sheet when the view cannot be captured", async () => {
    jest.mocked(captureRef).mockRejectedValueOnce(new Error("no view"));
    const { result } = await renderHook(() => useShareImage(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ current: null }),
      ).rejects.toThrow("no view");
    });

    expect(shareAsync).not.toHaveBeenCalled();
  });
});
