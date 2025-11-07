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
interface ManageHPPaymentModalProps extends UseManageHPPaymentProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageHPPaymentModal: React.FC<ManageHPPaymentModalProps> = ({
  isOpen,
  onClose,
  ...paymentProps
}) => {
  const {
    isEditMode,
    financialYearGroups,
    totals,
    expandedYears,
    paymentSchedule,
    isEarlySettlementOpen,
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
          {/* Action Buttons - Sticky container */}
          <div className="sticky top-0 pb-2 mb-2 z-10">
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
              financialYearGroups={financialYearGroups}
              totals={totals}
              depositAmount={paymentProps.depositAmount}
              expandedYears={expandedYears}
              onToggleYearExpansion={toggleYearExpansion}
            />
          </div>
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