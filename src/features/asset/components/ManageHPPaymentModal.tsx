import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/DialogExtended";
import { Button } from "@/components/ui/components";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useManageHPPayment, type UseManageHPPaymentProps } from "../hooks/useManageHPPayment";
import { EarlySettlementDialog } from "./EarlySettlementDialog";

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
        <div className="p-6 pt-2">
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
          <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-secondaryContainer sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left label-medium text-onSecondaryContainer">YA</th>
                  <th className="px-4 py-2 text-left label-medium text-onSecondaryContainer">No. of Instalments</th>
                  <th className="px-4 py-2 text-left label-medium text-onSecondaryContainer">Principal Amount</th>
                  <th className="px-4 py-2 text-left label-medium text-onSecondaryContainer">Interest Amount</th>
                  <th className="px-4 py-2 text-left label-medium text-onSecondaryContainer">Total Instalment Amount</th>
                  <th className="px-4 py-2 text-left label-medium text-onSecondaryContainer">Outstanding Principal</th>
                </tr>
              </thead>
              <tbody>
                {financialYearGroups.map((yearGroup) => {
                  const isExpanded = expandedYears.has(yearGroup.ya);
                  const totalPrincipal = yearGroup.months.reduce((sum, month) => sum + month.principalAmount, 0);
                  const totalInterest = yearGroup.months.reduce((sum, month) => sum + month.interestAmount, 0);
                  const totalInstalment = yearGroup.months.reduce((sum, month) => sum + month.totalInstalmentAmount, 0);
                  const closingBalance = yearGroup.months[yearGroup.months.length - 1]?.outstandingPrincipal || 0;

                  return (
                    <React.Fragment key={yearGroup.ya}>
                      {/* YA Header Row - Clickable */}
                      <tr
                        className="bg-secondary cursor-pointer hover:bg-hover"
                        onClick={() => { toggleYearExpansion(yearGroup.ya); }}
                      >
                        <td className="px-4 py-2 label-medium text-onSurface flex items-center gap-2">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          YA {yearGroup.ya}
                        </td>
                        <td className="px-4 py-2 label-medium text-onSurface">
                          {yearGroup.months.length}
                        </td>
                        <td className="px-4 py-2 label-medium text-onSurface">
                          RM {totalPrincipal.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 label-medium text-onSurface">
                          RM {totalInterest.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 label-medium text-onSurface">
                          RM {totalInstalment.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 label-medium text-onSurface">
                          RM {closingBalance.toFixed(2)}
                        </td>
                      </tr>
                      {/* Month Rows - Only show if expanded */}
                      {isExpanded && yearGroup.months.map((row) => {
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const monthName = monthNames[row.month - 1];
                        return (
                          <tr key={`row-${String(row.ya)}-${String(row.month)}`} className="bg-secondary">
                            <td className="px-4 py-2 label-small text-onSurfaceVariant pl-12">
                              {monthName} {row.ya} (Month {row.month})
                            </td>
                          <td></td>
                            <td className="px-4 py-2 label-small text-onSurfaceVariant">RM {row.principalAmount.toFixed(2)}</td>
                            <td className="px-4 py-2 label-small text-onSurfaceVariant">RM {row.interestAmount.toFixed(2)}</td>
                            <td className="px-4 py-2 label-small text-onSurfaceVariant">RM {row.totalInstalmentAmount.toFixed(2)}</td>
                            <td className="px-4 py-2 label-small text-onSurfaceVariant">RM {row.outstandingPrincipal.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}

                {/* Total Row */}
                <tr className="bg-secondaryContainer">
                  <td className="px-4 py-3 label-medium text-onSecondaryContainer">
                    Total
                  </td>
                  <td className="px-4 py-3 label-medium text-onSecondaryContainer">
                    {totals?.totalInstalments ?? 0}
                  </td>
                  <td className="px-4 py-3 label-medium text-onSecondaryContainer">
                    RM {(totals?.totalPrincipal ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 label-medium text-onSecondaryContainer">
                    RM {(totals?.totalInterest ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 label-medium text-onSecondaryContainer">
                    RM {(totals?.totalInstalmentAmount ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 label-medium text-onSecondaryContainer">
                    -
                  </td>
                </tr>

                {/* Deposit Row */}
                <tr className="bg-secondary">
                  <td className="px-4 py-3 label-medium-bold text-onSurface text-right" colSpan={4}>
                    Deposit
                  </td>
                  <td className="px-4 py-3 label-medium-bold text-onSurface">
                    RM {paymentProps.depositAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 label-medium-bold text-onSurface">
                    -
                  </td>
                </tr>

                {/* Total Payment Made Row */}
                <tr className="bg-tertiary">
                  <td className="px-4 py-3 label-medium-bold text-onTertiary text-right" colSpan={4}>
                    Total Payment Made (Instalments + Deposit)
                  </td>
                  <td className="px-4 py-3 label-medium-bold text-onTertiary">
                    RM {(totals?.totalPaymentMade ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 label-medium-bold text-onTertiary">
                    -
                  </td>
                </tr>
              </tbody>
            </table>
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