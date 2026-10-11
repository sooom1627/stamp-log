import {
  QueryClientProvider,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import { createTestQueryClient } from "@/shared/query/create-query-client";

import { listRallies, saveRally } from "../../db/rallies-db";
import { saveStamp } from "../../db/stamps-db";
import { type Rally } from "../../schemas/rallies";
import { type Stamp } from "../../schemas/stamps";
import {
  ralliesQueryKey,
  useDeleteRally,
  useRallies,
  useRally,
} from "../use-rallies";
import {
  stampsQueryKey,
  useDeleteStamp,
  useRallyStamps,
  useSaveStamp,
  useStamp,
  useStamps,
  useUpdateStamp,
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
    update: useUpdateStamp(),
    remove: useDeleteStamp(),
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

describe("S-006 ST-006 stamp update and delete Query hooks", () => {
  test("returns the edited stamp in its new place after update", async () => {
    const { result } = await renderHook(() => useRallyStampsFlow(604), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.query.isSuccess).toBe(true);
    });

    const oneDayAgo = daysAgoAt(1, 12);
    const fiveDaysAgo = daysAgoAt(5, 12);
    let editedId = 0;
    await act(async () => {
      editedId = (await result.current.save.mutateAsync({ rallyId: 604 })).id;
      await result.current.save.mutateAsync({
        rallyId: 604,
        stampedAt: oneDayAgo,
      });
    });

    await act(async () => {
      await result.current.update.mutateAsync({
        id: editedId,
        stampedAt: fiveDaysAgo,
        memo: "Moved back",
      });
    });

    await waitFor(() => {
      expect(
        result.current.query.data?.map((stamp) => stamp.stampedAt),
      ).toEqual([oneDayAgo, fiveDaysAgo]);
    });
    expect(result.current.query.data?.[1]).toMatchObject({
      id: editedId,
      memo: "Moved back",
    });
  });

  test("same-day edit sets isError and leaves the list unchanged", async () => {
    const { result } = await renderHook(() => useRallyStampsFlow(605), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.query.isSuccess).toBe(true);
    });

    const oneDayAgo = daysAgoAt(1, 12);
    let edited = { id: 0, stampedAt: "" };
    await act(async () => {
      await result.current.save.mutateAsync({
        rallyId: 605,
        stampedAt: oneDayAgo,
      });
      edited = await result.current.save.mutateAsync({ rallyId: 605 });
    });

    await waitFor(() => {
      expect(result.current.query.data).toHaveLength(2);
    });

    await act(async () => {
      await expect(
        result.current.update.mutateAsync({
          id: edited.id,
          stampedAt: daysAgoAt(1, 20),
          memo: "",
        }),
      ).rejects.toThrow("already has a stamp");
    });

    await waitFor(() => {
      expect(result.current.update.isError).toBe(true);
    });
    expect(
      result.current.query.data?.find((stamp) => stamp.id === edited.id)
        ?.stampedAt,
    ).toBe(edited.stampedAt);
  });

  test("removes the stamp from the list after delete", async () => {
    const { result } = await renderHook(() => useRallyStampsFlow(606), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.query.isSuccess).toBe(true);
    });

    let removedId = 0;
    await act(async () => {
      await result.current.save.mutateAsync({
        rallyId: 606,
        stampedAt: daysAgoAt(1, 12),
      });
      removedId = (await result.current.save.mutateAsync({ rallyId: 606 })).id;
    });

    await waitFor(() => {
      expect(result.current.query.data).toHaveLength(2);
    });

    await act(async () => {
      await result.current.remove.mutateAsync(removedId);
    });

    await waitFor(() => {
      expect(result.current.query.data).toHaveLength(1);
    });
    expect(
      result.current.query.data?.some((stamp) => stamp.id === removedId),
    ).toBe(false);
  });
});

describe("S-006 RT-002 ST-005 invalidate before mutation success", () => {
  test("the caller's onSuccess sees rallies and stamps without the deleted rally", async () => {
    await saveRally({ name: "Refetch check" });
    const { result } = await renderHook(
      () => ({
        queryClient: useQueryClient(),
        rallies: useRallies(),
        stamps: useStamps(),
        deleteRally: useDeleteRally(),
        save: useSaveStamp(),
      }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => {
      expect(result.current.rallies.isSuccess).toBe(true);
      expect(result.current.stamps.isSuccess).toBe(true);
    });
    const rally = result.current.rallies.data?.find(
      (candidate) => candidate.name === "Refetch check",
    );
    if (!rally) throw new Error("rally not saved");
    await act(async () => {
      await result.current.save.mutateAsync({ rallyId: rally.id });
    });

    let seen: { rallies?: Rally[]; stamps?: Stamp[] } = {};
    await act(async () => {
      await result.current.deleteRally.mutateAsync(rally.id, {
        onSuccess: () => {
          seen = {
            rallies: result.current.queryClient.getQueryData(ralliesQueryKey),
            stamps: result.current.queryClient.getQueryData(stampsQueryKey),
          };
        },
      });
    });

    expect(seen.rallies?.some((candidate) => candidate.id === rally.id)).toBe(
      false,
    );
    expect(seen.stamps?.some((stamp) => stamp.rallyId === rally.id)).toBe(
      false,
    );
  });
});

describe("RT-001 ST-003 useRally and useStamp read one record by id", () => {
  test("useRally returns the rally, and null once loaded without it", async () => {
    await saveRally({ name: "One by id", emoji: "🔎" });
    const rally = (await listRallies()).find(
      (candidate) => candidate.name === "One by id",
    );
    if (!rally) throw new Error("rally not saved");

    const { result } = await renderHook(
      () => ({ found: useRally(rally.id), missing: useRally(999999) }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.found.data).toEqual(rally);
    });
    expect(result.current.missing.data).toBeNull();
  });

  test("useStamp returns the stamp, and null once loaded without it", async () => {
    const stamp = await saveStamp({ rallyId: 701 });

    const { result } = await renderHook(
      () => ({ found: useStamp(stamp.id), missing: useStamp(999999) }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.found.data).toEqual(stamp);
    });
    expect(result.current.missing.data).toBeNull();
  });
});
