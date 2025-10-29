import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/DialogExtended";

interface ManageHPPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageHPPaymentModal: React.FC<ManageHPPaymentModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage HP Payment</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <p>HP Payment Management Modal - Coming Soon</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ManageHPPaymentModal };