import { registerBadgeTheme } from "@/components/ui/components";

registerBadgeTheme({
  variants: {
    primary: "bg-primaryContainer text-primary",
    red: "bg-red-100/60 text-red-700 dark:bg-red-400/22 dark:text-red-1300",
    green: "bg-green-100/60 text-green-700 dark:bg-green-400/22 dark:text-green-1300",
    yellow: "bg-amber-100/60 text-amber-700 dark:bg-amber-400/22 dark:text-amber-1300",
    orange: "bg-orange-100/60 text-orange-700 dark:bg-orange-400/22 dark:text-orange-1300",
    blue: "bg-blue-100/60 text-blue-700 dark:bg-blue-400/22 dark:text-blue-1300",
    grey: "bg-secondaryContainer text-onSurface",
  },
});
