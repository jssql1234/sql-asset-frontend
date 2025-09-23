import { registerFilterChipTheme } from "@/components/ui/components";

registerFilterChipTheme({
  variants: {
    default: {
      selected: "bg-primaryContainer text-onSurface hover:bg-primaryContainer/80 dark:bg-tertiaryContainer hover:dark:bg-tertiaryContainer/80",
      notSelected: "border border-outlineVariant text-onSurfaceVariant bg-transparent hover:bg-hover",
    },
  },
});