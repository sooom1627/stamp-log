import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listRallies, saveRally } from "../db/rallies-db";

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
