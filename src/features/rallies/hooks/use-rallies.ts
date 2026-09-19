import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteRally, listRallies, saveRally } from "../db/rallies-db";

import { stampsQueryKey } from "./use-stamps";

export const ralliesQueryKey = ["rallies"] as const;

export function useRallies() {
  return useQuery({
    queryKey: ralliesQueryKey,
    queryFn: listRallies,
    staleTime: Infinity,
  });
}

export function useSaveRally() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveRally,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ralliesQueryKey }),
  });
}

export function useDeleteRally() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRally,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ralliesQueryKey });
      queryClient.invalidateQueries({ queryKey: stampsQueryKey });
    },
  });
}
