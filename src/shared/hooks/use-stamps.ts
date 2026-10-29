import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteStamp,
  listStamps,
  saveStamp,
  updateStamp,
  updateStampMemo,
} from "@/shared/db/stamps-db";
import { type Stamp } from "@/shared/schemas/stamps";

export const stampsQueryKey = ["stamps"] as const;

const stampsQuery = queryOptions({
  queryKey: stampsQueryKey,
  queryFn: () => listStamps(),
});

export function useStamps() {
  return useQuery(stampsQuery);
}

export function useRallyStamps(rallyId: Stamp["rallyId"]) {
  return useQuery({
    ...stampsQuery,
    select: (stamps) => stamps.filter((stamp) => stamp.rallyId === rallyId),
  });
}

// One stamp by id: undefined while loading, null once loaded without it.
export function useStamp(stampId: Stamp["id"]) {
  return useQuery({
    ...stampsQuery,
    select: (stamps) => stamps.find((stamp) => stamp.id === stampId) ?? null,
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
