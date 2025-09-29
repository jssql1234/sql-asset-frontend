import { cn } from "@/utils/utils";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { X } from "@/assets/icons";
import React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/components/Button";

// ******************************  README  ***************************************

// To modify the default styles to your own styles:
// 1. create 'dialogStyles.tsx' in styles folder, add below code

// ```
// import { setDialogTheme } from "@/components/ui/components";
//
// setDialogTheme({
//   dialogTrigger: {
//     variant: "",
//     className: "",
//   },
//   dialogOverlay: {
//     base: "",
//     className: "",
//   },
//   dialogContent: {
//     base: "",
//     className: "",
//   },
//   dialogClose: {
//     variant: "",
//     base: "",
//     className: "",
//   },
//   dialogHeader: {
//     base: "",
//     className: "",
//   },
//   dialogFooter: {
//     base: "",
//     className: "",
//   },
//   dialogTitle: {
//     base: "l",
//     className: "",
//   },
//   dialogDescription: {
//     base: "",
//     className: ""
//   }
// });
// ```

// 2. add `import './styles/dialogStyles'` into main.tsx

// *****************************************************************************

const DIALOG_STYLES = {
  dialogTrigger: {
    variant: "default",
    className: "",
  },
  dialogOverlay: {
    base: "fixed inset-0 z-50 flex bg-scrim animate-in fade-in-0 duration-200",
    className: "",
  },
  dialogContent: {
    base: "flex flex-col gap-2 fixed overflow-hidden top-1/2 left-1/2 z-50 max-w-8/10 min-w-300p max-h-9/10 h-auto bg-surfaceContainerHigh rounded-lg p-6 shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-in fade-in-0 zoom-in-95 duration-200",
    className: "",
  },
  dialogClose: {
    variant: "secondary",
    base: "absolute right-4 top-4 cursor-pointer",
    className: "",
  },
  dialogHeader: {
    base: "flex flex-col space-y-1.5 text-center sm:text-left mb-4",
    className: "",
  },
  dialogFooter: {
    base: "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
    className: "",
  },
  dialogTitle: {
    base: "title-small leading-none text-onSurface truncate max-w-[calc(100%-4rem)] w-full text-start",
    className: "",
  },
  dialogDescription: {
    base: "h-full w-full overflow-auto body-medium text-onSurfaceVariant text-justify",
    className: "",
  },
};

const setDialogTheme = (config: {
  dialogTrigger?: {
    variant?: string;
    className?: string;
  };
  dialogOverlay?: {
    base?: string;
    className?: string;
  };
  dialogContent?: {
    base?: string;
    className?: string;
  };
  dialogClose?: {
    variant?: string;
    base?: string;
    className?: string;
  };
  dialogHeader?: {
    base?: string;
    className?: string;
  };
  dialogFooter?: {
    base?: string;
    className?: string;
  };
  dialogTitle?: {
    base?: string;
    className?: string;
  };
  dialogDescription?: {
    base?: string;
    className?: string;
  };
}) => {
  if (config.dialogTrigger?.variant)
    DIALOG_STYLES.dialogTrigger.variant = config.dialogTrigger.variant;
  if (config.dialogTrigger?.className)
    DIALOG_STYLES.dialogTrigger.className = config.dialogTrigger.className;

  if (config.dialogOverlay?.base)
    DIALOG_STYLES.dialogOverlay.base = config.dialogOverlay.base;
  if (config.dialogOverlay?.className)
    DIALOG_STYLES.dialogOverlay.className = config.dialogOverlay.className;

  if (config.dialogContent?.base)
    DIALOG_STYLES.dialogContent.base = config.dialogContent.base;
  if (config.dialogContent?.className)
    DIALOG_STYLES.dialogContent.className = config.dialogContent.className;

  if (config.dialogClose?.variant)
    DIALOG_STYLES.dialogClose.variant = config.dialogClose.variant;
  if (config.dialogClose?.base)
    DIALOG_STYLES.dialogClose.base = config.dialogClose.base;
  if (config.dialogClose?.className)
    DIALOG_STYLES.dialogClose.className = config.dialogClose.className;

  if (config.dialogHeader?.base)
    DIALOG_STYLES.dialogHeader.base = config.dialogHeader.base;
  if (config.dialogHeader?.className)
    DIALOG_STYLES.dialogHeader.className = config.dialogHeader.className;

  if (config.dialogFooter?.base)
    DIALOG_STYLES.dialogFooter.base = config.dialogFooter.base;
  if (config.dialogFooter?.className)
    DIALOG_STYLES.dialogFooter.className = config.dialogFooter.className;

  if (config.dialogTitle?.base)
    DIALOG_STYLES.dialogTitle.base = config.dialogTitle.base;
  if (config.dialogTitle?.className)
    DIALOG_STYLES.dialogTitle.className = config.dialogTitle.className;

  if (config.dialogDescription?.base)
    DIALOG_STYLES.dialogDescription.base = config.dialogDescription.base;
  if (config.dialogDescription?.className)
    DIALOG_STYLES.dialogDescription.className =
      config.dialogDescription.className;
};

// --------------------------------
//
// --------- Use Context ----------
//
// --------------------------------

type DialogContextType = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context)
    throw new Error("Dialog components must be used within <Dialog>");
  return context;
};

// --------------------------------
//
// ------------ Props -------------
//
// --------------------------------

interface DialogProps {
  className?: string;
  children: ReactNode;
}

interface DialogTriggerProps {
  variant?: string;
  className?: string;
  label?: string;
  disabled?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

// --------------------------------
//
// --------- Components -----------
//
// --------------------------------

const Dialog: React.FC<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}> = ({ open: controlledOpen, onOpenChange, children }) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger: React.FC<DialogTriggerProps> = ({
  variant,
  className,
  label,
  onClick,
  disabled,
  children,
}) => {
  const { setOpen } = useDialogContext();

  if (children && React.isValidElement(children)) {
    return (
      <div
        onClick={() => setOpen(true)}
        className={cn("inline-block cursor-pointer", className)}
      >
        {children}
      </div>
    );
  }

  return (
    <Button
      variant={variant ?? DIALOG_STYLES.dialogTrigger.variant}
      className={cn(DIALOG_STYLES.dialogTrigger.className, className)}
      disabled={disabled}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        onClick?.();
        setOpen(true);
      }}
    >
      {label}
    </Button>
  );
};

let portalRoot: HTMLElement | null = null;

const DialogPortal: React.FC<DialogProps> = ({ children }) => {
  if (!portalRoot && typeof window !== "undefined") {
    const div = document.createElement("div");
    div.setAttribute("id", "dialog-portal");
    document.body.appendChild(div);
    portalRoot = div;
  }

  return portalRoot
    ? createPortal(children, portalRoot)
    : null;
};

const DialogOverlay: React.FC<{ className?: string; onClose: () => void }> = ({
  className,
  onClose,
}) => {
  return (
    <div
      className={cn(
        DIALOG_STYLES.dialogOverlay.base,
        DIALOG_STYLES.dialogOverlay.className,
        className
      )}
      onClick={onClose}
    />
  );
};

const DialogContent: React.FC<{
  buttonVariant?: string;
  buttonDisabled?: boolean;
  dialogClose?: boolean;
  className?: string;
  buttonClassName?: string;
  children?: React.ReactNode;
}> = ({
  buttonVariant,
  buttonDisabled,
  dialogClose = true,
  className,
  buttonClassName,
  children,
}) => {
  const { open, setOpen } = useDialogContext();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [setOpen]);

  if (!open) return null;

  return (
    <DialogPortal>
      <DialogOverlay onClose={() => setOpen(false)} />
      <div
        className={cn(
          DIALOG_STYLES.dialogContent.base,
          DIALOG_STYLES.dialogContent.className,
          className
        )}
      >
        { dialogClose &&
          <DialogClose
            variant={buttonVariant}
            disabled={buttonDisabled}
            className={buttonClassName}
          />
        }
        {children}
      </div>
    </DialogPortal>
  );
};

const DialogClose: React.FC<{
  variant?: string;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}> = ({ variant, disabled, onClick, className, children }) => {
  const { setOpen } = useDialogContext();

  return (
    <Button
      variant={variant ?? DIALOG_STYLES.dialogClose.variant}
      disabled={disabled}
      className={cn(
        DIALOG_STYLES.dialogClose.base,
        DIALOG_STYLES.dialogClose.className,
        className
      )}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        onClick?.();
        setOpen(false);
      }}
    >
      {children ? (
        children
      ) : (
        <>
          <X className="w-5 h-5" />
          <span className="sr-only">Close</span>
        </>
      )}
    </Button>
  );
};

const DialogHeader: React.FC<DialogProps> = ({ className, children }) => {
  return (
    <div
      className={cn(
        DIALOG_STYLES.dialogHeader.base,
        DIALOG_STYLES.dialogHeader.className,
        className
      )}
    >
      {children}
    </div>
  );
};

const DialogFooter: React.FC<DialogProps> = ({ className, children }) => {
  return (
    <div
      className={cn(
        DIALOG_STYLES.dialogFooter.base,
        DIALOG_STYLES.dialogFooter.className,
        className
      )}
    >
      {children}
    </div>
  );
};

const DialogTitle: React.FC<DialogProps> = ({ className, children }) => {
  return (
    <h2
      className={cn(
        DIALOG_STYLES.dialogTitle.base,
        DIALOG_STYLES.dialogTitle.className,
        className
      )}
    >
      {children}
    </h2>
  );
};

const DialogDescription: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => {
  return (
    <div
      className={cn(
        DIALOG_STYLES.dialogDescription.base,
        DIALOG_STYLES.dialogDescription.className,
        className
      )}
    >
      {children}
    </div>
  );
};

export {
  setDialogTheme,
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};