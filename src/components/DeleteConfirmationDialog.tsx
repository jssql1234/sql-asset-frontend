import React from "react";
import { Button } from "@/components/ui/components";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/components";
import { Trash2 } from "lucide-react";

// Empty arrays defined outside component to prevent re-renders
const EMPTY_ARRAY: string[] = [];

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;

  // Title and description customization
  title?: string;
  description?: string;

  // Item details for dynamic content
  itemCount?: number;
  itemType?: string;
  itemName?: string; // For single item deletion
  itemNames?: string[]; // For multiple items
  itemIds?: string[];

  // Button text customization
  confirmButtonText?: string;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title,
  description,
  itemCount = 1,
  itemType = "item",
  itemName,
  itemNames = EMPTY_ARRAY,
  itemIds = EMPTY_ARRAY,
  confirmButtonText,
}) => {
  // Generate default title
  const defaultTitle =
    itemCount === 1
      ? `Delete ${itemType}${itemName ? "" : "?"}`
      : `Delete ${String(itemCount)} ${itemType}s`;

  // Generate default description
  const getDefaultDescription = () => {
    if (itemName) {
      return `Are you sure you want to delete ${
        itemType === "item" ? "the" : `the ${itemType}`
      } "${itemName}"? This action cannot be undone.`;
    }

    if (itemCount === 1) {
      return `Are you sure you want to delete this ${itemType}? This action cannot be undone.`;
    }

    return `Are you sure you want to delete these ${String(
      itemCount
    )} ${itemType}s? This action cannot be undone.`;
  };

  // Generate default confirm button text
  const getDefaultConfirmText = () => {
    if (itemCount > 1) {
      return `Delete (${String(itemCount)})`;
    }
    return `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`;
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-error">
            {title ?? defaultTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <p className="text-sm text-onSurfaceVariant">
            {description ?? getDefaultDescription()}
          </p>

          {/* Built-in Confirm Warning */}
          <div className="flex items-start gap-3 rounded-lg border border-error bg-errorContainer/40 p-3">
            <Trash2 className="h-5 w-5 text-error mt-0.5" />
            <div className="text-sm text-error">
              Please confirm you want to proceed.
            </div>
          </div>

          {/* Item IDs and Names List */}
          {itemIds.length > 0 && itemNames.length > 0 && (
            <div className="p-3 bg-surfaceContainer rounded-lg border border-outline">
              <h5 className="font-medium text-onSurface mb-3 text-sm">
                {itemCount === 1
                  ? "Asset to be affected:"
                  : `${String(itemCount)} assets to be affected:`}
              </h5>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {itemIds.map((id, index) => (
                  <div
                    key={id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded bg-surface/50 border border-outlineVariant/40"
                  >
                    {itemNames[index] && (
                      <span className="text-sm text-onSurfaceVariant truncate">
                        {itemNames[index]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="min-w-20"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-w-20"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              confirmButtonText ?? getDefaultConfirmText()
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
