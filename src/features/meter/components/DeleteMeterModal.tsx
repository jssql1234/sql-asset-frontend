import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from "@/components/ui/components";

type DeleteConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemDetails?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
};

export const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Delete Item",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  itemDetails,
  confirmText = "Delete",
  cancelText = "Cancel",
}: DeleteConfirmationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
            {itemDetails && (
              <div className="mt-2 p-3 bg-surfaceContainer rounded-md">
                {itemDetails}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Keep the old name for backward compatibility
export const DeleteMeterModal = DeleteConfirmationDialog;

export default DeleteConfirmationDialog;
