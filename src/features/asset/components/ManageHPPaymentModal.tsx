import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/DialogExtended";
import { Button } from "@/components/ui/components";
import { useManageHPPayment, type UseManageHPPaymentProps } from "../hooks/useManageHPPayment";
import { EarlySettlementDialog } from "./EarlySettlementDialog";
import { HPPaymentScheduleTable } from "./HPPaymentScheduleTable";
import { Info } from "lucide-react";

interface ManageHPPaymentModalProps extends UseManageHPPaymentProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageHPPaymentModal: React.FC<ManageHPPaymentModalProps> = ({
  isOpen,
  onClose,
  ...paymentProps
}) => {
  // Debug: Log the props when modal opens
  React.useEffect(() => {
    if (isOpen) {
      console.log('📋 HP Payment Modal opened with props:', paymentProps);
    }
  }, [isOpen, paymentProps]);

  const {
    isLoading,
    isEditMode,
    financialYearGroups,
    totals,
    expandedYears,
    paymentSchedule,
    updatePaymentSchedule,
    isEarlySettlementOpen,
    hasCustomSchedule, 
    toggleEditMode,
    toggleYearExpansion,
    resetPaymentSchedule,
    savePaymentSchedule,
    openEarlySettlement,
    closeEarlySettlement,
    applyEarlySettlement,
  } = useManageHPPayment(paymentProps);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-full">
        <DialogHeader>
          <DialogTitle>Manage HP Payment</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-2 flex flex-col" style={{ overflow: 'auto', maxHeight: '600px' }}>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading Schedule...</p>
            </div>
          ) : (
            <>
              {/* NEW: Custom Schedule Indicator */}
              {hasCustomSchedule && !isEditMode && (
                <div className="flex items-center gap-2 p-3 mb-2 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                  <Info className="w-4 h-4" />
                  <span>
                    This schedule has been customized with manual edits or early settlement. 
                    Changing calculation parameters will reset to a new calculated schedule.
                  </span>
                </div>
              )}

              {/* Action Buttons - Sticky container */}
              <div className="sticky top-0 pb-2 mb-2 z-10 bg-surface">
                <div className="flex gap-2">
                  {!isEditMode && (
                    <Button onClick={toggleEditMode} variant="outline">
                      Edit
                    </Button>
                  )}
                  {isEditMode && (
                    <>
                      <Button onClick={openEarlySettlement} variant="outline">
                        Early Settlement
                      </Button>
                      <Button onClick={resetPaymentSchedule} variant="outline">
                        Reset
                      </Button>
                      <Button onClick={toggleEditMode} variant="outline">
                        Cancel
                      </Button>
                      <Button onClick={savePaymentSchedule} variant="default">
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Schedule Table */}
              <div style={{ overflowY: 'auto' }}>
                <HPPaymentScheduleTable 
                  isEditMode={isEditMode}
                  financialYearGroups={financialYearGroups}
                  totals={totals}
                  depositAmount={paymentProps.depositAmount}
                  expandedYears={expandedYears}
                  updatePaymentSchedule={updatePaymentSchedule}
                  onToggleYearExpansion={toggleYearExpansion}
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>

      {/* Early Settlement Dialog */}
      <EarlySettlementDialog
        isOpen={isEarlySettlementOpen}
        onClose={closeEarlySettlement}
        paymentSchedule={paymentSchedule}
        onApply={applyEarlySettlement}
      />
    </Dialog>
  );
};

export { ManageHPPaymentModal };