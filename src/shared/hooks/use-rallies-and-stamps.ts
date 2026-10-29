import { type UseQueryResult } from "@tanstack/react-query";

import { useRallies } from "./use-rallies";

// Screens that show stamps with their rallies load, fail and retry both
// together. `stampsQuery` is the stamps query the screen reads.
export function useRalliesAndStamps<TStamps>(
  stampsQuery: UseQueryResult<TStamps>,
) {
  const {
    data: rallies,
    isError: isRalliesError,
    refetch: refetchRallies,
  } = useRallies();
  const {
    data: stamps,
    isError: isStampsError,
    refetch: refetchStamps,
  } = stampsQuery;

  const retry = () => {
    void refetchRallies();
    void refetchStamps();
  };

  return {
    rallies,
    stamps,
    isLoaded: rallies !== undefined && stamps !== undefined,
    isError: isRalliesError || isStampsError,
    retry,
  };
}
