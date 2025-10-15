import React from 'react';
import { Button } from '@/components/ui/components';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/components';
import { Banner } from '@/components/ui/components';

interface DeleteGroupConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  groupName: string;
  isLoading?: boolean;
}

const DeleteGroupConfirmationDialog: React.FC<DeleteGroupConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  groupName,
  isLoading = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-error">
            Delete User Group
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mb-4">
          <p className="text-sm text-onSurfaceVariant">
            Are you sure you want to delete the user group <strong>"{groupName}"</strong>?
            This action cannot be undone.
          </p>

          {/* Warning Banner */}
          <Banner
            variant="error"
            title="Warning"
            description="Users assigned to this group will be automatically reassigned to the admin group."
            dismissible={false}
          />
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
                <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              'Delete Group'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteGroupConfirmationDialog;