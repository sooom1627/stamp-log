import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import { saveRally } from "@/features/rallies/db/rallies-db";
import { useRallies } from "@/features/rallies/hooks/use-rallies";
import { useStamps } from "@/features/rallies/hooks/use-stamps";
import { createTestQueryClient } from "@/shared/query/create-query-client";

import { type Backup } from "../../schemas/backup";
import { useImportData } from "../use-import-data";

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

const fileBackup: Backup = {
  app: "stamp-log",
  version: 1,
  exportedAt: "2026-10-24T06:00:00.000Z",
  rallies: [
    {
      id: 12,
      name: "Edinburgh",
      emoji: "☕️",
      isFavorite: true,
      isArchived: false,
    },
  ],
  stamps: [
    {
      id: 68,
      rallyId: 12,
      stampedAt: "2026-10-25T03:29:06.662Z",
      memo: "12:15",
    },
  ],
};

function useImportFlow() {
  const rallies = useRallies();
  const stamps = useStamps();
  const importData = useImportData();
  return { rallies, stamps, importData };
}

describe("S-041 T-002 ST-002 import data hook", () => {
  test("shows the file's rallies and stamps after importing", async () => {
    await saveRally({ name: "Old rally" });
    const { result } = await renderHook(() => useImportFlow(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.rallies.data).toEqual([
        expect.objectContaining({ name: "Old rally" }),
      ]);
    });

    await act(async () => {
      await result.current.importData.mutateAsync(fileBackup);
    });

    await waitFor(() => {
      expect(result.current.rallies.data).toEqual(fileBackup.rallies);
    });
    expect(result.current.stamps.data).toEqual([
      { ...fileBackup.stamps[0], photos: [] },
    ]);
  });
});
