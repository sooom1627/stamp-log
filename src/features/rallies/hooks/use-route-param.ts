import { useLocalSearchParams } from "expo-router";

import { type z } from "zod";

import { useCloseWhenMissing } from "@/shared/hooks/use-close-when-missing";

import {
  dateParamSchema,
  idParamSchema,
  monthParamSchema,
  pageParamSchema,
  yearParamSchema,
} from "../schemas/route-params";

// Reads a URL param in a route file. An invalid value is treated like a
// missing record: the screen closes and `undefined` is returned.
function useRouteParam<TSchema extends z.ZodType>(
  name: string,
  schema: TSchema,
): z.output<TSchema> | undefined {
  const params = useLocalSearchParams();
  const result = schema.safeParse(params[name]);
  const isValid = result.success;
  useCloseWhenMissing(!isValid);

  return isValid ? result.data : undefined;
}

export function useIdParam(name: string) {
  return useRouteParam(name, idParamSchema);
}

// A local calendar day such as "2026-09-18", today or earlier.
export function useDateParam(name: string) {
  return useRouteParam(name, dateParamSchema);
}

// A local month such as "2026-10", this month or earlier.
export function useMonthParam(name: string) {
  return useRouteParam(name, monthParamSchema);
}

// A year such as "2026", this year or earlier.
export function useYearParam(name: string) {
  return useRouteParam(name, yearParamSchema);
}

// A page of the year review, 1 to 4.
export function usePageParam(name: string) {
  return useRouteParam(name, pageParamSchema);
}
