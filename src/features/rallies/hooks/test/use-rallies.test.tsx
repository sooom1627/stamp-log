import {
  QueryClientProvider,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import { createTestQueryClient } from "@/shared/query/create-query-client";

import { saveRally } from "../../db/rallies-db";
import { type Rally } from "../../schemas/rallies";
import {
  ralliesQueryKey,
  useRallies,
  useSetRallyFavorite,
  useUpdateRally,
} from "../use-rallies";

let queryClient: QueryClient;

afterEach(() => {
  queryClient.clear();
});

function createWrapper() {
  queryClient = createTestQueryClient();

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("S-013 T-001 ST-003 useUpdateRally", () => {
  test("rallies show the updated name and emoji when the caller's onSuccess runs", async () => {
    await saveRally({ name: "Walk", emoji: "🚶" });
    const { result } = await renderHook(
      () => ({
        queryClient: useQueryClient(),
        rallies: useRallies(),
        updateRally: useUpdateRally(),
      }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => {
      expect(result.current.rallies.isSuccess).toBe(true);
    });
    const walk = result.current.rallies.data?.find(
      (rally) => rally.name === "Walk",
    );
    if (!walk) throw new Error("rally not saved");
    const updated: Rally = {
      id: walk.id,
      name: "Hike",
      emoji: "⛰️",
      isFavorite: false,
    };

    let seen: Rally[] | undefined;
    await act(async () => {
      await result.current.updateRally.mutateAsync(updated, {
        onSuccess: () => {
          seen = result.current.queryClient.getQueryData(ralliesQueryKey);
        },
      });
    });

    expect(seen?.find((rally) => rally.id === walk.id)).toEqual(updated);
    await waitFor(() => {
      expect(
        result.current.rallies.data?.find((rally) => rally.id === walk.id),
      ).toEqual(updated);
    });
  });
});

describe("S-032 T-001 ST-004 useSetRallyFavorite", () => {
  test("rallies show the favorite once it is set", async () => {
    await saveRally({ name: "Favorite walk", emoji: "🚶" });
    const { result } = await renderHook(
      () => ({
        rallies: useRallies(),
        setRallyFavorite: useSetRallyFavorite(),
      }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => {
      expect(result.current.rallies.isSuccess).toBe(true);
    });
    const walk = result.current.rallies.data?.find(
      (rally) => rally.name === "Favorite walk",
    );
    if (!walk) throw new Error("rally not saved");
    expect(walk.isFavorite).toBe(false);

    await act(async () => {
      await result.current.setRallyFavorite.mutateAsync({
        id: walk.id,
        isFavorite: true,
      });
    });

    await waitFor(() => {
      expect(
        result.current.rallies.data?.find((rally) => rally.id === walk.id),
      ).toEqual({ ...walk, isFavorite: true });
    });
  });
});
