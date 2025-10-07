import { setDropdownTheme } from "@/components/ui/components";

setDropdownTheme({
  trigger: {
    variant: "dropdown",
    className: "",
  },
  content: {
    base: "z-20 absolute overflow-auto transition-all duration-200 ease-out bg-surfaceContainerHighest border border-outline rounded-lg shadow text-onSurface",
    className: "",
  },
  item: {
    base: "cursor-pointer focus:outline-none rounded-md px-2 py-2 body-medium text-onSurface hover:bg-hover",
    focus: "bg-hover",
    className: "",
  },
});
