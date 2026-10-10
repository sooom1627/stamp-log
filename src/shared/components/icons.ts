import {
  Check as LucideCheck,
  ChevronLeft as LucideChevronLeft,
  ChevronRight as LucideChevronRight,
  Plus as LucidePlus,
  Star as LucideStar,
} from "lucide-react-native";
import { withUniwind } from "uniwind";

// Lucide icons wrapped once for `colorClassName="accent-*"` (Uniwind: never wrap
// the same component in more than one file). Import icons from here.
export const Check = withUniwind(LucideCheck);
export const ChevronLeft = withUniwind(LucideChevronLeft);
export const ChevronRight = withUniwind(LucideChevronRight);
export const Plus = withUniwind(LucidePlus);
// Filled for the favorite mark, so the fill takes a color class too.
export const Star = withUniwind(LucideStar, {
  color: { fromClassName: "colorClassName", styleProperty: "accentColor" },
  fill: { fromClassName: "fillClassName", styleProperty: "accentColor" },
});
