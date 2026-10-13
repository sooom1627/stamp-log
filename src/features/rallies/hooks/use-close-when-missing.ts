import { useEffect } from "react";

import { useRouter } from "expo-router";

// Closes the screen when what it shows is missing (an invalid URL param or a
// record that does not exist): back if there is a screen to return to,
// otherwise home.
export function useCloseWhenMissing(isMissing: boolean) {
  const { back, canGoBack, replace } = useRouter();

  useEffect(() => {
    if (!isMissing) return;
    if (canGoBack()) {
      back();
      return;
    }
    replace("/");
  }, [isMissing, back, canGoBack, replace]);
}
