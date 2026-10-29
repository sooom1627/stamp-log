import { useRallies } from "./use-rallies";
import { useStamps } from "./use-stamps";

// Screens that show stamps with their rallies load, fail and retry both lists
// together.
export function useRalliesAndStamps() {
  const {
    data: rallies,
    isError: isRalliesError,
    refetch: refetchRallies,
  } = useRallies();
  const {
    data: stamps,
    isError: isStampsError,
    refetch: refetchStamps,
  } = useStamps();

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
