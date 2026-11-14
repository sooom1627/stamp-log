import { useEffect } from "react";

import * as SplashScreen from "expo-splash-screen";

// Keeps the launch screen up for `ms` after the first render, then hides it.
// Call SplashScreen.preventAutoHideAsync() at module scope before using this.
export function useHideSplashAfter(ms: number) {
  useEffect(() => {
    const timer = setTimeout(() => {
      void SplashScreen.hideAsync();
    }, ms);
    return () => clearTimeout(timer);
  }, [ms]);
}
