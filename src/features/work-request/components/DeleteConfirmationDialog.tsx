import React from 'react';
import { Button } from '@/components/ui/components/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/components/Dialog';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemCount: number;
  itemType?: string;
  title?: string;
  description?: string;
  isLoading?: boolean;
  itemIds?: string[];
  itemNames?: string[];
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemCount,
  itemType = 'work request',
  title,
  description,
  isLoading = false,
  itemIds = [],
  itemNames = [],
}) => {
  const defaultTitle = itemCount === 1 
    ? `Delete ${itemType}` 
    : `Delete ${itemCount} ${itemType}s`;
    
  const defaultDescription = itemCount === 1
    ? `Are you sure you want to delete this ${itemType}? This action cannot be undone.`
    : `Are you sure you want to delete these ${itemCount} ${itemType}s? This action cannot be undone.`;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">
            {title || defaultTitle}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          <p className="text-sm text-onSurfaceVariant">
            {description || defaultDescription}
          </p>


          {/* Item IDs and Names List */}
          {itemIds.length > 0 && (
            <div className="p-3 bg-surfaceContainer rounded-lg border border-outline">
              <h5 className="font-medium text-onSurface mb-2">
                {itemCount === 1 ? 'Item to be deleted:' : `${itemCount} items to be deleted:`}
              </h5>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {itemIds.map((id, index) => (
                  <div key={id} className="flex items-center gap-2 text-sm">
                    {itemNames[index] && (
                      <span className="text-onSurfaceVariant truncate">
                        {itemNames[index]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        <DialogFooter>
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
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              `Delete ${itemCount === 1 ? '' : `(${itemCount})`}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;