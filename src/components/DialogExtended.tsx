import { cn } from "@/utils/utils";
import {
  createContext,
  type ReactNode,
  use,
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
  dialogPortal: {
    base: "fixed inset-0 flex items-center justify-center bg-scrim p-4 z-10",
    className: "",
  },
  dialogTrigger: {
    variant: "default",
    className: "",
  },
  dialogOverlay: {
    base: "relative animate-in fade-in-0 duration-200",
    className: "",
  },
  dialogContent: {
    base: "flex flex-col gap-2 overflow-hidden z-50 max-w-8/10 min-w-300p max-h-9/10 h-auto bg-surfaceContainerHigh rounded-lg p-6 shadow-lg animate-in fade-in-0 zoom-in-95 duration-200",
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


// --------------------------------
//
// --------- Use Context ----------
//
// --------------------------------

interface DialogContextType {
  open: boolean;
  setOpen: (value: boolean) => void;
  dialogId: string;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

const useDialogContext = () => {
  const context = use(DialogContext);
  if (context === undefined)
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}> = ({ open, onOpenChange, children }) => {
  // Generate stable dialog ID only once per component instance
  const dialogIdRef = React.useRef<string>(React.useId());
  const dialogId = dialogIdRef.current;

  // Memoize setOpen function to prevent unnecessary re-renders
  const setOpen = React.useCallback((newOpen: boolean) => {
    onOpenChange(newOpen);
  }, [onOpenChange]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    open,
    setOpen,
    dialogId,
  }), [open, setOpen, dialogId]);

  return (
    <DialogContext value={ contextValue }>
      {children}
    </DialogContext>
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
        onClick={() => {
          setOpen(true);
        }}
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


// Global registry for active dialogs - tracks stable z-indexes
const activeDialogs = new Map<string, { close: () => void; zIndex: number }>();

const DialogPortal: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const { dialogId, setOpen } = useDialogContext();
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  React.useEffect(() => {
    const existingDiv = document.getElementById(`dialog-portal-${dialogId}`);
    if (existingDiv !== null) {
      setPortalElement(() => existingDiv);
      return;
    }

    // Create portal element
    const div = document.createElement("div");
    div.setAttribute("id", `dialog-portal-${dialogId}`);
    div.className = cn(DIALOG_STYLES.dialogPortal.base, DIALOG_STYLES.dialogPortal.className);
    document.body.appendChild(div);
    setPortalElement(() => div);

    return () => {
      if (div.parentNode !== null) {
        div.parentNode.removeChild(div);
      }
    };
  }, [dialogId]);

  React.useEffect(() => {
    const index = activeDialogs.size;

     // Register dialog
    activeDialogs.set(dialogId, {
      close: () => { setOpen(false) },
      zIndex: index,
    });

    return () => {
      activeDialogs.delete(dialogId);
    };
  }, [dialogId, setOpen]);

  // Global ESC key handler
  React.useEffect(() => {
    const handleGlobalEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        const dialogs = Array.from(activeDialogs.values());
        if (dialogs.length > 0) {
          const topDialog = dialogs.reduce((top, current) =>
            current.zIndex > top.zIndex ? current : top
          );
          topDialog.close();
        }
      }
    };

    document.addEventListener("keydown", handleGlobalEsc);
    return () => {
      document.removeEventListener("keydown", handleGlobalEsc);
    };
  }, []);

  // Only render portal when element is ready
  if (!portalElement) {
    return null;
  }

  return createPortal(
    <>
      <div
        className={cn(
          DIALOG_STYLES.dialogOverlay.base,
          DIALOG_STYLES.dialogOverlay.className
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setOpen(false);
          }
        }}
      >
        {children}
      </div>
    </>,
    portalElement
  );
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
  const { open } = useDialogContext();

  // If not open, don't render anything
  if (!open) {
    return null;
  }

  // Render through DialogPortal which handles ModalManager registration
  return (
    <DialogPortal>
      <div
        className={cn(
          DIALOG_STYLES.dialogContent.base,
          DIALOG_STYLES.dialogContent.className,
          className
        )}
      >
        {dialogClose &&
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
      {children ?? (
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

