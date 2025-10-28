import { IconTrash, IconInfoCircle } from "@tabler/icons-react";

export {
  IconCircleCheckFilled as CircleCheckFilled,
  IconCircleXFilled as CircleXFilled,
  IconInfoCircleFilled as InfoCircleFilled,
  IconAlertTriangleFilled as AlertTriangleFilled,
  IconEye as Eye,
  IconX as X,
  IconChevronDown as ChevronDown,
  IconChevronUp as ChevronUp,
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
  IconChevronsLeft as ChevronsLeft,
  IconChevronsRight as ChevronsRight,
  IconCaretUpDown as CaretUpDown,
  IconCaretUpFilled as CaretUpFilled,
  IconCaretDownFilled as CaretDownFilled,
  IconCheck as Check,
  IconPointFilled as PointFilled,
  IconDots as Dots,
  IconPlus as Plus,
  IconDotsVertical as DotsVertical,
  IconTransfer as Change,
  IconFileFilled as File,
  IconUpload as Upload,
  IconSearch as Search,
  IconFilterFilled as FilterFilled,
  IconFilter as Filter,
  IconEdit as Edit,
  IconCopy as Copy,
  IconCircleCheck as CircleCheck,
  IconCircleX as CircleX,
  IconHomeFilled as HomeFilled,
  IconBriefcase as Briefcase,
  IconBriefcaseFilled as BriefcaseFilled,
  IconLink as Link,
  IconLogout as LogOut,
  IconFileExport as ExportFile,
  IconPrinter as Printer,
  IconCalendarWeek as Calendar, 
  IconCalendarWeekFilled as CalendarFilled,
  IconUser as User,
  IconSun as Sun,
  IconMoon as Moon,
  IconMenu2 as Sidebar,
  IconArrowLeft as ArrowLeft,
  IconCalculator as Calculator,
  IconLayoutDashboard as LayoutDashboard,
  IconClock as Clock,
  IconGauge as Gauge,
  IconShieldCheck as ShieldCheck,
  IconCalculatorFilled as CalculatorFilled,
  IconLayoutDashboardFilled as LayoutDashboardFilled,
  IconClockFilled as ClockFilled,
  IconGaugeFilled as GaugeFilled,
  IconShieldCheckFilled as ShieldCheckFilled,
  IconTrashFilled as BinFilled,
  IconMapPin as Location,
  IconMapPinFilled as LocationFilled,
} from "@tabler/icons-react";

// Re-export icons with multiple names for compatibility
export { IconTrash as Bin, IconTrash as Delete };
export { IconInfoCircle as Info };

// Lazy-loaded icons - import these only when needed
// These are imported dynamically to reduce initial bundle size
// Example usage: const { IconBuilding } = await import("@tabler/icons-react");

// To use lazy-loaded icons, create a separate file for them:
// export const lazyIcons = {
//   IconBuildingStore: () => import("@tabler/icons-react").then(m => m.IconBuildingStore),
//   IconShoppingCart: () => import("@tabler/icons-react").then(m => m.IconShoppingCart),
//   // ... etc
// };

// Alternatively, for better performance, import these directly where needed:
// Example: import { IconBuildingStore } from "@tabler/icons-react";