import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/DialogExtended";
import { Button } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaymentRow } from "../services/hpPaymentService";
import { earlySettlementFormSchema, type EarlySettlementFormData } from "../zod/earlySettlementForm";

interface EarlySettlementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paymentSchedule: PaymentRow[];
  onApply: (settlementMonth: number, interestAmount: number) => void;
}

const EarlySettlementDialog: React.FC<EarlySettlementDialogProps> = ({
  isOpen,
  onClose,
  paymentSchedule,
  onApply,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [interestAmount, setInterestAmount] = useState<string>("");
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [validationErrors, setValidationErrors] = useState<{
    month: string | null;
    interest: string | null;
  }>({
    month: null,
    interest: null,
  });

  // Validate form using Zod (only called on submit)
  const validateForm = () => {
    try {
      const formData: EarlySettlementFormData = {
        selectedMonth: selectedMonth ?? 0,
        interestAmount,
      };

      earlySettlementFormSchema.parse(formData);
      setValidationErrors({ month: null, interest: null });
      return true;
    } catch (error) {
      if (error && typeof error === 'object' && 'issues' in error) {
        const zodError = error as { issues: { path: string[]; message: string }[] };
        const errors = { month: null as string | null, interest: null as string | null };

        zodError.issues.forEach((issue) => {
          if (issue.path.includes('selectedMonth')) {
            errors.month = issue.message;
          } else if (issue.path.includes('interestAmount')) {
            errors.interest = issue.message;
          }
        });

        setValidationErrors(errors);
        return false;
      }
      return false;
    }
  };

  // Update currentYear when paymentSchedule changes
  useEffect(() => {
    if (paymentSchedule.length > 0) {
      const years = new Set<number>();
      paymentSchedule.forEach(row => years.add(row.ya));
      const minYear = Math.min(...Array.from(years));
      setCurrentYear(minYear);
    }
  }, [paymentSchedule]);

  // Get available years from payment schedule
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    paymentSchedule.forEach(row => years.add(row.ya));
    return Array.from(years).sort();
  }, [paymentSchedule]);

  // Get available months for current year
  const availableMonths = useMemo(() => {
    return paymentSchedule
      .filter(row => row.ya === currentYear)
      .map(row => row.month)
      .sort((a, b) => a - b);
  }, [paymentSchedule, currentYear]);

  // Calculate instalment number from selected month/year
  const selectedInstalmentNumber = useMemo(() => {
    if (!selectedMonth || !selectedYear) return null;
    const row = paymentSchedule.find(
      r => r.ya === selectedYear && r.month === selectedMonth
    );
    return row?.instalmentNumber ?? null;
  }, [paymentSchedule, selectedMonth, selectedYear]);

  // Month names
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const handleMonthClick = (month: number) => {
    if (availableMonths.includes(month)) {
      setSelectedMonth(month);
      setSelectedYear(currentYear);
      // Clear month validation error when a valid month is selected
      setValidationErrors(prev => ({ ...prev, month: null }));
    }
  };

  const handleApply = () => {
    if (validateForm() && selectedInstalmentNumber) {
      const interest = parseFloat(interestAmount);
      onApply(selectedInstalmentNumber, interest);
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setSelectedMonth(null);
    setSelectedYear(null);
    setInterestAmount("");
    setValidationErrors({ month: null, interest: null });
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };



  return (
    <Dialog open={isOpen} onOpenChange={() => {
      resetForm();
      onClose();
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Early Settlement</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-6 pt-4">
          {/* Month-Year Selector */}
          <div>
            <label className="body-small text-onSurface mb-2 block">
              Select Settlement Month & Year
            </label>

            {/* Year Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setCurrentYear(prev => prev - 1); }}
                disabled={currentYear <= Math.min(...availableYears)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="label-large font-medium">{currentYear}</span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => { setCurrentYear(prev => prev + 1); }}
                disabled={currentYear >= Math.max(...availableYears)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Month Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {monthNames.map((monthName, index) => {
                const monthNumber = index + 1;
                const isAvailable = availableMonths.includes(monthNumber);
                const isSelected = selectedMonth === monthNumber && selectedYear === currentYear;

                return (
                  <button
                    key={monthName}
                    type="button"
                    onClick={() => { handleMonthClick(monthNumber); }}
                    disabled={!isAvailable}
                    className={`
                      px-3 py-2 text-sm rounded-md border transition-colors
                      ${isSelected
                        ? 'bg-primary text-onPrimary border-primary'
                        : isAvailable
                          ? 'bg-surface hover:bg-surfaceContainerHighest border-outlineVariant text-onSurface'
                          : 'bg-surfaceContainerLowest border-outlineVariant text-onSurfaceVariant cursor-not-allowed'
                      }
                    `}
                  >
                    {monthName}
                  </button>
                );
              })}
            </div>

            {/* Selected Month/Year Display */}
            {selectedInstalmentNumber && selectedMonth && selectedYear && (
              <div className="text-center p-3 bg-primaryContainer rounded-md">
                <div className="label-medium text-onPrimaryContainer">
                  {monthNames[selectedMonth - 1]} {selectedYear}
                </div>
                <div className="body-small text-onPrimaryContainer/80">
                  Instalment {selectedInstalmentNumber} of {paymentSchedule.length}
                </div>
              </div>
            )}

            {/* Month Selection Error */}
            {validationErrors.month && (
              <div className="text-error body-small mt-1">
                {validationErrors.month}
              </div>
            )}
          </div>

          {/* Interest Amount Input */}
          <div>
            <label className="body-small text-onSurface mb-2 block">
              Settlement Interest Amount (RM)
            </label>
            <Input
              type="number"
              placeholder="0.00"
              value={interestAmount}
              onChange={(e) => {
                setInterestAmount(e.target.value);
                // Clear interest validation error when user starts typing
                if (validationErrors.interest) {
                  setValidationErrors(prev => ({ ...prev, interest: null }));
                }
              }}
              min="0"
              step="0.01"
            />
            {/* Interest Amount Error */}
            {validationErrors.interest && (
              <div className="text-error body-small mt-1">
                {validationErrors.interest}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1"
            >
              Apply Settlement
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { EarlySettlementDialog };