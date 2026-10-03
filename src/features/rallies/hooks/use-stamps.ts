import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  deleteStamp,
  listStamps,
  saveStamp,
  updateStamp,
  updateStampMemo,
} from "../db/stamps-db";
import { type Stamp } from "../schemas/stamps";

export const stampsQueryKey = ["stamps"] as const;

export function useStamps(): UseQueryResult<Stamp[]> {
  return useQuery({
    queryKey: stampsQueryKey,
    queryFn: listStamps,
    staleTime: Infinity,
  });
}

export function useRallyStamps(rallyId: Stamp["rallyId"]) {
  return useQuery({
    queryKey: stampsQueryKey,
    queryFn: listStamps,
    staleTime: Infinity,
    select: (stamps) => stamps.filter((stamp) => stamp.rallyId === rallyId),
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

export function useUpdateStamp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStamp,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: stampsQueryKey }),
  });
}

export function useDeleteStamp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStamp,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: stampsQueryKey }),
  });
}
