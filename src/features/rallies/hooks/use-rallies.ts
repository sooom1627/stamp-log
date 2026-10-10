import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteRally,
  listRallies,
  saveRally,
  setRallyArchived,
  setRallyFavorite,
  updateRally,
} from "../db/rallies-db";

import { stampsQueryKey } from "./use-stamps";

export const ralliesQueryKey = ["rallies"] as const;

export function useRallies() {
  return useQuery({
    queryKey: ralliesQueryKey,
    queryFn: listRallies,
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
