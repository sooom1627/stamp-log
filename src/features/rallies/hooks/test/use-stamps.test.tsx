import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import { createTestQueryClient } from "@/shared/query/create-query-client";

import { useSaveStamp, useStamps } from "../use-stamps";

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
  return { query, save };
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
