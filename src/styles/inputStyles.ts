import { setInputTheme } from "@/components/ui/components/Input";

setInputTheme({
  base: `
    flex w-full rounded-sm transition-colors outline-none
    bg-white border border-gray-300 p-2 md:px-4
    body-medium placeholder:text-gray-500 text-gray-900
    file:border-0 file:bg-white file:body-medium file:text-gray-900
    focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500
    disabled:pointer-events-none disabled:opacity-50 disabled:bg-gray-100
  `,
});