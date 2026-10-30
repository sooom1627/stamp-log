import {
  ArrowUpRight as LucideArrowUpRight,
  Check as LucideCheck,
  ChevronLeft as LucideChevronLeft,
  ChevronRight as LucideChevronRight,
  CircleHelp as LucideCircleHelp,
  Download as LucideDownload,
  FileText as LucideFileText,
  Image as LucideImage,
  Info as LucideInfo,
  Languages as LucideLanguages,
  Lock as LucideLock,
  Plus as LucidePlus,
  Shield as LucideShield,
  Star as LucideStar,
  Upload as LucideUpload,
  X as LucideX,
} from "lucide-react-native";
import { withUniwind } from "uniwind";

// Lucide icons wrapped once for `colorClassName="accent-*"` (Uniwind: never wrap
// the same component in more than one file). Import icons from here.
export const ArrowUpRight = withUniwind(LucideArrowUpRight);
export const Check = withUniwind(LucideCheck);
export const ChevronLeft = withUniwind(LucideChevronLeft);
export const ChevronRight = withUniwind(LucideChevronRight);
export const CircleHelp = withUniwind(LucideCircleHelp);
export const Download = withUniwind(LucideDownload);
export const FileText = withUniwind(LucideFileText);
// Named ImageIcon so it never shadows an image component.
export const ImageIcon = withUniwind(LucideImage);
export const Info = withUniwind(LucideInfo);
export const Languages = withUniwind(LucideLanguages);
export const Lock = withUniwind(LucideLock);
export const Plus = withUniwind(LucidePlus);
export const Shield = withUniwind(LucideShield);
export const Upload = withUniwind(LucideUpload);
export const X = withUniwind(LucideX);
// Filled for the favorite mark, so the fill takes a color class too.
export const Star = withUniwind(LucideStar, {
  color: { fromClassName: "colorClassName", styleProperty: "accentColor" },
  fill: { fromClassName: "fillClassName", styleProperty: "accentColor" },
});
