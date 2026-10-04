import { useEffect } from "react";

import { useLocalSearchParams, useRouter } from "expo-router";

import { type z } from "zod";

import { dateParamSchema, idParamSchema } from "../schemas/route-params";

// Reads a URL param in a route file. An invalid value is treated like a
// missing record: the screen closes and `undefined` is returned.
function useRouteParam<TSchema extends z.ZodType>(
  name: string,
  schema: TSchema,
): z.output<TSchema> | undefined {
  const params = useLocalSearchParams();
  const { back, canGoBack, replace } = useRouter();
  const result = schema.safeParse(params[name]);
  const isValid = result.success;

  useEffect(() => {
    if (isValid) return;
    if (canGoBack()) {
      back();
      return;
    }
    replace("/");
  }, [isValid, back, canGoBack, replace]);

  return isValid ? result.data : undefined;
}

export function useIdParam(name: string) {
  return useRouteParam(name, idParamSchema);
}

// A local calendar day such as "2026-09-18", today or earlier.
export function useDateParam(name: string) {
  return useRouteParam(name, dateParamSchema);
}
