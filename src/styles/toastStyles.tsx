import { AlertTriangleFilled, CircleCheckFilled, CircleXFilled, InfoCircleFilled } from "@/assets/icons";
import { registerToastTheme } from "@/components/ui/components/Toast";

registerToastTheme({
  base: "shadow-md max-w-sm w-full p-4 rounded-lg bg-surfaceContainerHighest text-onSurface z-10",
  className: "",
  title: {
    base: "text-onSurface label-medium-bold",
    className: "",
  },
  description: {
    base: "text-onSurfaceVariant label-small mt-1",
    className: "",
  },
  action: {
    base: "label-medium-bold text-primary hover:text-primary/80 focus:outline-none cursor-pointer mr-2",
    className: "",
  },
  dismissible: {
    base: "hover:opacity-80 focus:outline-none transition-colors cursor-pointer",
    className: "",
  },
  variants: {
    success: {
      icon: (<CircleCheckFilled className={"w-5 h-5 flex-shrink-0 mr-3 text-green-500"}/>),
      title: "",
      description: "",
      action: "",
    },
    error: {
      icon: (
        <CircleXFilled className={"w-5 h-5 flex-shrink-0 mr-3 text-red-500"} />
      ),
      title: "",
      description: "",
      action: "",
    },
    warning: {
      icon: (
        <AlertTriangleFilled
          className={"w-5 h-5 flex-shrink-0 mr-3 text-yellow-500"}
        />
      ),
      title: "",
      description: "",
      action: "",
    },
    info: {
      icon: (
        <InfoCircleFilled
          className={"w-5 h-5 flex-shrink-0 mr-3 text-blue-500"}
        />
      ),
      title: "",
      description: "",
      action: "",
    },
    loading: {
      icon: (
        <div
          className={
            "w-5 h-5 flex-shrink-0 mr-3 text-onSurface animate-spin rounded-full border-2 border-current border-t-transparent"
          }
        />
      ),
      title: "",
      description: "",
      action: "",
    },
  }
});