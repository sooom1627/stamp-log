import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listStamps, saveStamp } from "../db/rallies-db";
import { type SaveStampInput, type Stamp } from "../schemas/stamps";

export const stampsQueryKey = ["stamps"] as const;

function warnStampError(context: string, error: unknown) {
  console.warn(`[stamps] ${context}`, error);
}

export function useStamps() {
  return useQuery({
    queryKey: stampsQueryKey,
    queryFn: async () => {
      try {
        return await listStamps();
      } catch (error) {
        warnStampError("list failed", error);
        throw error;
      }
    },
    retry: false,
    staleTime: Infinity,
  });
}

export function useSaveStamp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveStampInput) => {
      try {
        return await saveStamp(input);
      } catch (error) {
        warnStampError("save failed", error);
        throw error;
      }
    },
    onSuccess: (stamp) => {
      console.warn("[stamps] saved", stamp);
      queryClient.setQueryData<Stamp[]>(stampsQueryKey, (current) => [
        stamp,
        ...(current ?? []),
      ]);
    },
  });
}
