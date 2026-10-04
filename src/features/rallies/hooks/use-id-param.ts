import { useEffect } from "react";

import { useLocalSearchParams, useRouter } from "expo-router";

import { idParamSchema } from "../schemas/route-params";

// Reads an id URL param in a route file. An invalid value is treated like a
// missing record: the screen closes and `undefined` is returned.
export function useIdParam(name: string) {
  const params = useLocalSearchParams();
  const { back, canGoBack, replace } = useRouter();
  const result = idParamSchema.safeParse(params[name]);
  const id = result.success ? result.data : undefined;

  useEffect(() => {
    if (id !== undefined) return;
    if (canGoBack()) {
      back();
      return;
    }
    replace("/");
  }, [id, back, canGoBack, replace]);

  return id;
}
