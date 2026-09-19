import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listStamps, saveStamp } from "../db/stamps-db";

export const stampsQueryKey = ["stamps"] as const;

export function useStamps() {
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
