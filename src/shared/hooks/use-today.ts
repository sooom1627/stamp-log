import { useEffect, useState } from "react";

import { AppState } from "react-native";

import { localDateKey } from "@/shared/utils/local-date-key";

function msUntilNextLocalMidnight(now: Date) {
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  return nextMidnight.getTime() - now.getTime();
}

// Today as a Date that changes only when the local day does. Tab screens stay
// mounted, and React Compiler computes a bare `new Date()` once, so screens
// that show "today" read it from here. The day is checked when the app comes
// back (JS timers stop in the background) and at local midnight while open.
export function useToday() {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    let midnightTimer: ReturnType<typeof setTimeout>;
    const checkDay = () => {
      const now = new Date();
      setToday((shown) =>
        localDateKey(shown) === localDateKey(now) ? shown : now,
      );
      // Re-armed on every check, so a timer that fires a little early (or a
      // day that changes on resume) still leads to the next midnight.
      clearTimeout(midnightTimer);
      midnightTimer = setTimeout(checkDay, msUntilNextLocalMidnight(now));
    };
    midnightTimer = setTimeout(checkDay, msUntilNextLocalMidnight(new Date()));
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") checkDay();
    });
    return () => {
      clearTimeout(midnightTimer);
      subscription.remove();
    };
  }, []);

  return today;
}
