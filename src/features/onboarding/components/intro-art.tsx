import { ExampleRalliesArt } from "./example-rallies-art";
import { QuietTrailArt } from "./quiet-trail-art";
import { StampedMonthArt } from "./stamped-month-art";
import { TryStampArt } from "./try-stamp-art";

// Pictures for the four intro pages (S-047), drawn after the design canvas.
// Views, not images, so they follow the theme; they only show, never save.
// Each plays once the first time its page opens (S-054).
export const introArt = [
  StampedMonthArt,
  ExampleRalliesArt,
  TryStampArt,
  QuietTrailArt,
] as const;
