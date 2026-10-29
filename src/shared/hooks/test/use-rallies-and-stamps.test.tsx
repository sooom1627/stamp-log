import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import * as ralliesDb from "@/shared/db/rallies-db";
import * as stampsDb from "@/shared/db/stamps-db";
import { createTestQueryClient } from "@/shared/query/create-query-client";

import { useRalliesAndStamps } from "../use-rallies-and-stamps";

let queryClient: QueryClient;

afterEach(() => {
  queryClient.clear();
  jest.restoreAllMocks();
});

function createWrapper() {
  queryClient = createTestQueryClient();

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("RT ST-006 useRalliesAndStamps", () => {
  test("is loaded once both lists are read", async () => {
    await ralliesDb.saveRally({ name: "Walk", emoji: "🚶" });
    const saved = await stampsDb.saveStamp({ rallyId: 1 });

    const { result } = await renderHook(() => useRalliesAndStamps(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoaded).toBe(false);
    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });
    expect(result.current.isError).toBe(false);
    expect(result.current.rallies?.map(({ name }) => name)).toContain("Walk");
    expect(result.current.stamps?.map(({ id }) => id)).toContain(saved.id);
  });

  test("reports an error when either list fails, and retry reads both again", async () => {
    const listStamps = jest
      .spyOn(stampsDb, "listStamps")
      .mockRejectedValueOnce(new Error("disk full"));
    const listRallies = jest.spyOn(ralliesDb, "listRallies");

    const { result } = await renderHook(() => useRalliesAndStamps(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.isLoaded).toBe(false);

    await act(async () => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });
    expect(result.current.isError).toBe(false);
    expect(listStamps).toHaveBeenCalledTimes(2);
    expect(listRallies).toHaveBeenCalledTimes(2);
  });
});
