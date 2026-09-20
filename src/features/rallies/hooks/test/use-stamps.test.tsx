import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import { createTestQueryClient } from "@/shared/query/create-query-client";

import { useSaveStamp, useStamps, useUpdateStampMemo } from "../use-stamps";

const queryClients: QueryClient[] = [];

afterEach(() => {
  for (const queryClient of queryClients) {
    queryClient.clear();
  }
  queryClients.length = 0;
});

function createWrapper() {
  const queryClient = createTestQueryClient();
  queryClients.push(queryClient);

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function useStampsFlow() {
  const query = useStamps();
  const save = useSaveStamp();
  const updateMemo = useUpdateStampMemo();
  return { query, save, updateMemo };
}

describe("ST-003 stamp Query hooks", () => {
  test("starts with an empty array", async () => {
    const { result } = await renderHook(() => useStamps(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual([]);
  });

  test("returns new stamp in list after save", async () => {
    const { result } = await renderHook(() => useStampsFlow(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.query.isSuccess).toBe(true);
    });

    await act(async () => {
      await result.current.save.mutateAsync({ rallyId: 1 });
    });

    await waitFor(() => {
      expect(result.current.query.data).toHaveLength(1);
    });
    expect(result.current.query.data?.[0].rallyId).toBe(1);
  });
});

describe("ST-004 memo update Query hook", () => {
  test("returns stamp with memo in list after update", async () => {
    const { result } = await renderHook(() => useStampsFlow(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.query.isSuccess).toBe(true);
    });

    let savedId = 0;
    await act(async () => {
      const saved = await result.current.save.mutateAsync({ rallyId: 1 });
      savedId = saved.id;
    });

    await waitFor(() => {
      expect(
        result.current.query.data?.some((stamp) => stamp.id === savedId),
      ).toBe(true);
    });

    await act(async () => {
      await result.current.updateMemo.mutateAsync({
        id: savedId,
        memo: "Met them",
      });
    });

    await waitFor(() => {
      expect(
        result.current.query.data?.find((stamp) => stamp.id === savedId)?.memo,
      ).toBe("Met them");
    });
  });

  test("empty memo update sets isError and leaves list unchanged", async () => {
    const { result } = await renderHook(() => useStampsFlow(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.query.isSuccess).toBe(true);
    });

    let savedId = 0;
    await act(async () => {
      const saved = await result.current.save.mutateAsync({ rallyId: 1 });
      savedId = saved.id;
    });

    await waitFor(() => {
      expect(
        result.current.query.data?.find((stamp) => stamp.id === savedId)?.memo,
      ).toBeNull();
    });

    await act(async () => {
      await expect(
        result.current.updateMemo.mutateAsync({ id: savedId, memo: "" }),
      ).rejects.toThrow();
    });

    expect(result.current.updateMemo.isError).toBe(true);
    expect(
      result.current.query.data?.find((stamp) => stamp.id === savedId)?.memo,
    ).toBeNull();
  });
});
