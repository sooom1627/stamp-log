import {
  ChevronRight as LucideChevronRight,
  ListChecks as LucideListChecks,
  MapPinPen as LucideMapPinPen,
  Plus as LucidePlus,
  UsersRound as LucideUsersRound,
} from "lucide-react-native";
import { withUniwind } from "uniwind";

// Lucide icons wrapped once for `colorClassName="accent-*"` (Uniwind: never wrap
// the same component in more than one file). Import icons from here.
export const ChevronRight = withUniwind(LucideChevronRight);
export const ListChecks = withUniwind(LucideListChecks);
export const MapPinPen = withUniwind(LucideMapPinPen);
export const Plus = withUniwind(LucidePlus);
export const UsersRound = withUniwind(LucideUsersRound);
