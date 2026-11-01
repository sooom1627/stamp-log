import {
  keepPreviousData,
  queryOptions,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getFirstStampedAt,
  getStampSummary,
} from "@/shared/db/stamp-summary-db";
import {
  deleteStamp,
  getStamp,
  listPhotoDayStamps,
  listRallyStamps,
  listStamps,
  listStampsBetween,
  saveStamp,
  updateStamp,
  updateStampMemo,
} from "@/shared/db/stamps-db";
import { type Stamp, type StampPhoto } from "@/shared/schemas/stamps";
import { addLocalDays } from "@/shared/utils/add-local-days";

export const stampsQueryKey = ["stamps"] as const;

const stampsQuery = queryOptions({
  queryKey: stampsQueryKey,
  queryFn: () => listStamps(),
});

export function useStamps() {
  return useQuery(stampsQuery);
}

// Without a rally (its stamp is still loading) nothing is read yet.
export function useRallyStamps(rallyId: Stamp["rallyId"] | undefined) {
  return useQuery({
    queryKey: [...stampsQueryKey, "byRally", rallyId],
    queryFn: rallyId === undefined ? skipToken : () => listRallyStamps(rallyId),
  });
}

// One stamp by id: undefined while loading, null once loaded without it.
export function useStamp(stampId: Stamp["id"]) {
  return useQuery({
    queryKey: [...stampsQueryKey, "byId", stampId],
    queryFn: () => getStamp(stampId),
  });
}

// What rally tiles and the today card show: every rally's count, and the
// stamps of the 7 local days ending `today`. When the day turns, the last
// day's summary stays while the new one loads, so tiles do not blink empty.
export function useStampSummary(today: Date) {
  const since = addLocalDays(today, -6).toISOString();
  return useQuery({
    queryKey: [...stampsQueryKey, "summary", since],
    queryFn: () => getStampSummary(since),
    placeholderData: keepPreviousData,
  });
}

// The stamps from `start` up to (not including) `end`. While a new range
// loads, the last one stays, so a calendar does not blink empty.
export function useStampsBetween(start: Date, end: Date) {
  const startIso = start.toISOString();
  const endIso = end.toISOString();
  return useQuery({
    queryKey: [...stampsQueryKey, "between", startIso, endIso],
    queryFn: () => listStampsBetween(startIso, endIso),
    placeholderData: keepPreviousData,
  });
}

// The oldest stamp's time (null without stamps), for the calendar's years.
export function useFirstStampedAt() {
  return useQuery({
    queryKey: [...stampsQueryKey, "first"],
    queryFn: () => getFirstStampedAt(),
  });
}

// The stamps of a photo's rally on that photo's local day (the photo viewer).
// Empty once loaded without the photo.
export function usePhotoDayStamps(photoId: StampPhoto["id"]) {
  return useQuery({
    queryKey: [...stampsQueryKey, "photoDay", photoId],
    queryFn: () => listPhotoDayStamps(photoId),
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
