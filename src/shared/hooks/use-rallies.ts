import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteRally,
  listRallies,
  saveRally,
  setRallyArchived,
  setRallyFavorite,
  updateRally,
} from "@/shared/db/rallies-db";
import { type Rally } from "@/shared/schemas/rallies";

import { stampsQueryKey } from "./use-stamps";

export const ralliesQueryKey = ["rallies"] as const;

const ralliesQuery = queryOptions({
  queryKey: ralliesQueryKey,
  queryFn: () => listRallies(),
});

export function useRallies() {
  return useQuery(ralliesQuery);
}

// One rally by id: undefined while loading, null once loaded without it.
// Without an id (its stamp is still loading) it is null too.
export function useRally(rallyId: Rally["id"] | undefined) {
  return useQuery({
    ...ralliesQuery,
    select: (rallies) => rallies.find((rally) => rally.id === rallyId) ?? null,
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

export function useUpdateRally() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRally,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ralliesQueryKey }),
  });
}

export function useSetRallyFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setRallyFavorite,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ralliesQueryKey }),
  });
}

export function useSetRallyArchived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setRallyArchived,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ralliesQueryKey }),
  });
}

export function useDeleteRally() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRally,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ralliesQueryKey }),
        queryClient.invalidateQueries({ queryKey: stampsQueryKey }),
      ]),
  });
}
