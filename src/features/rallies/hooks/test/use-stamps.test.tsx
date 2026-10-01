import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import { createTestQueryClient } from "@/shared/query/create-query-client";

import { useDeleteRally } from "../use-rallies";
import {
  useRallyStamps,
  useSaveStamp,
  useStamps,
  useUpdateStampMemo,
} from "../use-stamps";

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

function yesterdayAt(hours: number) {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
}

describe("S-025 ST-003 past stamp Query hook", () => {
  test("returns the past stamp in the list after save", async () => {
    const { result } = await renderHook(() => useStampsFlow(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.query.isSuccess).toBe(true);
    });

    const stampedAt = yesterdayAt(12);
    await act(async () => {
      await result.current.save.mutateAsync({ rallyId: 301, stampedAt });
    });

    await waitFor(() => {
      expect(
        result.current.query.data?.some(
          (stamp) => stamp.rallyId === 301 && stamp.stampedAt === stampedAt,
        ),
      ).toBe(true);
    });
  });

  test("same-day past stamp sets isError and leaves list unchanged", async () => {
    const { result } = await renderHook(() => useStampsFlow(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.query.isSuccess).toBe(true);
    });

    await act(async () => {
      await result.current.save.mutateAsync({
        rallyId: 302,
        stampedAt: yesterdayAt(12),
      });
    });

    await waitFor(() => {
      expect(
        result.current.query.data?.filter((stamp) => stamp.rallyId === 302),
      ).toHaveLength(1);
    });

    await act(async () => {
      await expect(
        result.current.save.mutateAsync({
          rallyId: 302,
          stampedAt: yesterdayAt(20),
        }),
      ).rejects.toThrow("already has a stamp");
    });

    await waitFor(() => {
      expect(result.current.save.isError).toBe(true);
    });
    expect(
      result.current.query.data?.filter((stamp) => stamp.rallyId === 302),
    ).toHaveLength(1);
  });
});

function daysAgoAt(days: number, hours: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
}

function useRallyStampsFlow(rallyId: number) {
  return {
    query: useRallyStamps(rallyId),
    save: useSaveStamp(),
    updateMemo: useUpdateStampMemo(),
    deleteRally: useDeleteRally(),
  };
}

describe("S-006 ST-002 useRallyStamps", () => {
  test("returns only this rally's stamps, newest first, after save", async () => {
    const { result } = await renderHook(() => useRallyStampsFlow(601), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.query.isSuccess).toBe(true);
    });

    const threeDaysAgo = daysAgoAt(3, 12);
    const oneDayAgo = daysAgoAt(1, 12);
    let now = "";
    await act(async () => {
      await result.current.save.mutateAsync({
        rallyId: 601,
        stampedAt: threeDaysAgo,
      });
      now = (await result.current.save.mutateAsync({ rallyId: 601 })).stampedAt;
      await result.current.save.mutateAsync({
        rallyId: 601,
        stampedAt: oneDayAgo,
      });
      await result.current.save.mutateAsync({ rallyId: 602 });
    });

    await waitFor(() => {
      expect(
        result.current.query.data?.map((stamp) => stamp.stampedAt),
      ).toEqual([now, oneDayAgo, threeDaysAgo]);
    });
    expect(
      result.current.query.data?.every((stamp) => stamp.rallyId === 601),
    ).toBe(true);
  });

  test("returns the memo after update", async () => {
    const { result } = await renderHook(() => useRallyStampsFlow(602), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.query.isSuccess).toBe(true);
    });

    let savedId = 0;
    await act(async () => {
      savedId = (await result.current.save.mutateAsync({ rallyId: 602 })).id;
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

  test("returns an empty list after the rally is deleted", async () => {
    const { result } = await renderHook(() => useRallyStampsFlow(603), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.query.isSuccess).toBe(true);
    });

    await act(async () => {
      await result.current.save.mutateAsync({ rallyId: 603 });
    });

    await waitFor(() => {
      expect(result.current.query.data).toHaveLength(1);
    });

    await act(async () => {
      await result.current.deleteRally.mutateAsync(603);
    });

    await waitFor(() => {
      expect(result.current.query.data).toEqual([]);
    });
  });
});
