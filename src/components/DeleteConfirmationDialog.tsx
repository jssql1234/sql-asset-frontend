import { Button } from "@/components/ui/components";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/components";
import { Trash2 } from "lucide-react";

// Empty arrays defined outside component to prevent re-renders
const EMPTY_ARRAY: string[] = [];

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;

  // Title and description customization
  title?: string;
  description?: string;

  // Item details for dynamic content
  itemCount?: number;
  itemName?: string; // For single item deletion
  itemNames?: string[]; // For multiple items
  itemIds?: string[];

  confirmButtonText?: string;  // Button text customization
}

const DeleteConfirmationDialog = (props: DeleteConfirmationDialogProps) => {
  const {
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    itemCount = 1,
    itemName,
    itemNames = EMPTY_ARRAY,
    itemIds = EMPTY_ARRAY,
    confirmButtonText,
  } = props;
  
  // Generate default title
  const defaultTitle =
    itemCount === 1 ? `Delete item${itemName ? "" : "?"}` : `Delete ${String(itemCount)} items`;

  // Generate default description
  const getDefaultDescription = () => {
    if (itemName) {
      return `Are you sure you want to delete the item "${itemName}"? This action cannot be undone.`;
    }

    if (itemCount === 1) {
      return `Are you sure you want to delete this item? This action cannot be undone.`;
    }

    return `Are you sure you want to delete these ${String(
      itemCount
    )} items? This action cannot be undone.`;
  };

  // Generate default confirm button text
  const getDefaultConfirmText = () => {
    if (itemCount > 1) {
      return `Delete (${String(itemCount)})`;
    }
    return `Delete Item`;
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-error">{title ?? defaultTitle}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <p className="text-sm text-onSurfaceVariant">{description ?? getDefaultDescription()}</p>

          {/* Built-in Confirm Warning */}
          <div className="flex items-start gap-3 rounded-lg border border-error bg-errorContainer/40 p-3">
            <Trash2 className="h-5 w-5 text-error mt-0.5" />
            <div className="text-sm text-error">Please confirm you want to proceed.</div>
          </div>

          {/* Item IDs and Names List */}
          {itemIds.length > 0 && itemNames.length > 0 && (
            <div className="p-3 bg-surfaceContainer rounded-lg border border-outline">
              <h5 className="font-medium text-onSurface mb-3 text-sm">
                {itemCount === 1 ? "Item to be affected:" : `${String(itemCount)} items to be affected:`}
              </h5>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                {itemIds.map((id, index) => (
                  <div
                    key={id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded bg-surface/50 border border-outlineVariant/40"
                  >
                    {itemNames[index] && (
                      <span className="text-sm text-onSurfaceVariant truncate">{itemNames[index]}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-3">
          <Button variant="outline" size="sm" onClick={onClose} className="min-w-20">Cancel</Button>
          <Button variant="destructive" size="sm" onClick={handleConfirm} className="min-w-20">{confirmButtonText ?? getDefaultConfirmText()}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
