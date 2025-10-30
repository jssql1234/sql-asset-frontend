import { Dialog, DialogContent } from "@/components/ui/components";
import { Button } from "@/components/ui/components";
import { CircleCheckFilled } from "@/assets/icons";
import type { Warranty } from "../types";

interface WarrantyCheckDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  warranty: Warranty | null;
}

export const WarrantyCheckDialog: React.FC<WarrantyCheckDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  warranty,
}) => {
  if (!warranty) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[700px] max-w-[90vw]">
        {/* Header with Success Icon */}
        <div className="flex items-start gap-4 pt-6 pb-4">
          <div className="flex-shrink-0">
            <CircleCheckFilled className="h-12 w-12 text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className="headline-small font-semibold text-onSurface mb-2">
              Warranty Available!
            </h2>
            <p className="body-medium text-onSurfaceVariant">
              You may proceed create warranty claim in <strong>Insurance & Claim</strong> {""}
              for this work order before starting the work.
            </p>
          </div>
        </div>


        {/* Footer Actions */}
        <div className="px-6 flex justify-end gap-3 border-t border-outlineVariant pt-4">
          <Button
            variant="default"
            onClick={onConfirm}
            className="px-6"
          >
            Understood
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WarrantyCheckDialog;
