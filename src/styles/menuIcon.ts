import { registerButtonTheme } from "@/components/ui/components";

registerButtonTheme({
  variants: {
    default: "bg-primary text-onPrimary hover:bg-primary/80",
    destructive: "bg-error text-onError hover:bg-error/80",
    outline: "border border-outline bg-surfaceContainer text-onSurface hover:bg-hover",
    secondary: "bg-secondary text-onSurface hover:bg-secondary/80",
    link: "text-primary hover:underline bg-transparent hover:bg-transparent",
    ghost: "bg-transparent hover:bg-hover text-onSurface",
    dropdown: "border border-gray-300 bg-surfaceContainerHighest text-onSurface hover:bg-hover",
    dialog: "bg-transparent hover:bg-hover text-onSurfaceVariant",
  },
  sizes: {
    default: "h-9 px-4 py-2 label-medium",
    sm: "h-8 px-2 label-medium",
    lg: "h-10 px-6 label-large",
    icon: "h-8 w-8 p-2",
    dropdown: "px-4 py-2 body-medium"
  }
});
