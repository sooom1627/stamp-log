import { File } from "expo-file-system";
import { shareAsync } from "expo-sharing";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import * as ralliesDb from "@/features/rallies/db/rallies-db";
import { saveStamp } from "@/features/rallies/db/stamps-db";
import { createTestQueryClient } from "@/shared/query/create-query-client";

import { backupSchema } from "../../schemas/backup";
import { useExportData } from "../use-export-data";

jest.useFakeTimers();

const queryClients: QueryClient[] = [];

beforeEach(() => {
  jest.setSystemTime(new Date(2026, 9, 25, 9, 30));
  jest.mocked(shareAsync).mockClear();
});

afterEach(() => {
  jest.restoreAllMocks();
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

describe("S-041 T-001 ST-004 export data hook", () => {
  test("writes every rally and stamp to a dated JSON file and shares it", async () => {
    await ralliesDb.saveRally({ name: "Kyoto trip", emoji: "⛩️" });
    const [kyoto] = await ralliesDb.listRallies();
    await saveStamp({ rallyId: kyoto.id });
    const { result } = await renderHook(() => useExportData(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(shareAsync).toHaveBeenCalledTimes(1);
    const [uri, options] = jest.mocked(shareAsync).mock.calls[0];
    const file = new File(uri);
    expect(file.name).toBe("stamp-log-2026-10-25.json");
    expect(options).toEqual({
      mimeType: "application/json",
      UTI: "public.json",
    });
    const backup = backupSchema.parse(JSON.parse(file.textSync()));
    expect(backup.rallies).toContainEqual(
      expect.objectContaining({ id: kyoto.id, name: "Kyoto trip" }),
    );
    expect(backup.stamps).toContainEqual(
      expect.objectContaining({ rallyId: kyoto.id }),
    );
  });

  test("does not open the share sheet when the data cannot be read", async () => {
    jest
      .spyOn(ralliesDb, "listRallies")
      .mockRejectedValue(new Error("disk error"));
    const { result } = await renderHook(() => useExportData(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(shareAsync).not.toHaveBeenCalled();
  });
});
