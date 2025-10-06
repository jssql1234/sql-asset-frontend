import { setTextAreaTheme } from "@/components/ui/components/Input";

setTextAreaTheme({
  base: `
    resize-none
    flex w-full rounded-sm transition-colors outline-none
    bg-surfaceContainerHighest
    border border-outlineVariant px-2 py-2 md:px-4
    body-medium placeholder:text-outlineVariant text-onSurface
    file:border-0 file:bg-surfaceContainerHighest file:body-medium file:text-onSurface
    focus-visible:ring-1 focus-visible:ring-primary
    disabled:pointer-events-none disabled:opacity-38
  `
});