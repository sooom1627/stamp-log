import { useRallies } from "@/shared/hooks/use-rallies";
import { useStampSummary } from "@/shared/hooks/use-stamps";
import { useToday } from "@/shared/hooks/use-today";
import { sortRalliesForHome } from "@/shared/utils/sort-rallies-for-home";

// Every rally in home's order: its tiles first, then archived rallies (as
// home's cards). The month and year images break count ties with it.
// Undefined until both lists load.
export function useRalliesInHomeOrder() {
  const { data: rallies } = useRallies();
  // Home's tiles sort by all-time counts.
  const { data: summary } = useStampSummary(useToday());
  if (!rallies || !summary) return undefined;

  return [
    ...sortRalliesForHome(
      rallies.filter((rally) => !rally.isArchived),
      summary.countsByRally,
    ),
    ...rallies.filter((rally) => rally.isArchived),
  ];
}
