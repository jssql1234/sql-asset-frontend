import { registerButtonTheme } from "@/components/ui/components";

registerButtonTheme({
  variants: {
    dropdown: "border border-outlineVariant bg-surfaceContainerHighest text-onSurface hover:bg-hover",
    dialog: "bg-transparent hover:bg-hover text-onSurfaceVariant",
  },
});
