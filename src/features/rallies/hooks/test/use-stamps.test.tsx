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

describe("ST-003 stamps の Query hooks", () => {
  test("初期は空配列", async () => {
    const { result } = await renderHook(() => useStamps(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual([]);
  });

  test("save のあと list が新しい stamp を返す", async () => {
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

describe("ST-004 memo 更新の Query hook", () => {
  test("update のあと list が memo 付き stamp を返す", async () => {
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
        memo: "会った",
      });
    });

    await waitFor(() => {
      expect(
        result.current.query.data?.find((stamp) => stamp.id === savedId)?.memo,
      ).toBe("会った");
    });
  });

  test("空 memo の update は isError になり list は変わらない", async () => {
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
