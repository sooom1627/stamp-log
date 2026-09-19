import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import { listStamps, saveStamp, updateStampMemo } from "../db/stamps-db";
import { type Stamp } from "../schemas/stamps";

export const stampsQueryKey = ["stamps"] as const;

export function useStamps(): UseQueryResult<Stamp[]> {
  return useQuery({
    queryKey: stampsQueryKey,
    queryFn: listStamps,
    staleTime: Infinity,
  });
}

export function useSaveStamp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveStamp,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: stampsQueryKey }),
  });
}

export function useUpdateStampMemo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStampMemo,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: stampsQueryKey }),
  });
}
