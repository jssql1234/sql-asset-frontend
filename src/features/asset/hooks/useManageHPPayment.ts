import { useState, useEffect, useCallback } from 'react';
import { hpPaymentService, type PaymentRow, type FinancialYearGroup, type HPPaymentTotals } from '../services/hpPaymentService';

export interface UseManageHPPaymentProps {
  depositAmount: number;
  interestRate: number;
  numberOfInstalments: number;
  totalCost: number;
  startDate: string;
}

export const useManageHPPayment = (props: UseManageHPPaymentProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentRow[]>([]);
  const [, setOriginalPaymentSchedule] = useState<PaymentRow[]>([]);
  const [pristineSchedule, setPristineSchedule] = useState<PaymentRow[]>([]); // Holds the initial, unmodified schedule
  const [financialYearGroups, setFinancialYearGroups] = useState<FinancialYearGroup[]>([]);
  const [totals, setTotals] = useState<HPPaymentTotals | null>(null);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(() => new Set()); // Track expanded YA groups
  const [isEarlySettlementOpen, setIsEarlySettlementOpen] = useState(false);
  const { depositAmount, interestRate, numberOfInstalments, totalCost, startDate } = props;

  // Reusable function to process the schedule for display
  const processScheduleForDisplay = useCallback((schedule: PaymentRow[], deposit: number) => {
    const groups = schedule.reduce((acc: FinancialYearGroup[], row) => {
      let group = acc.find(g => g.ya === row.ya);
      if (!group) {
        group = { ya: row.ya, months: [] };
        acc.push(group);
      }
      group.months.push(row);
      return acc;
    }, []);

    const newTotals: HPPaymentTotals = {
      totalInstalments: schedule.filter(r => r.totalInstalmentAmount > 0).length,
      totalPrincipal: schedule.reduce((sum, row) => sum + row.principalAmount, 0),
      totalInterest: schedule.reduce((sum, row) => sum + row.interestAmount, 0),
      totalInstalmentAmount: schedule.reduce((sum, row) => sum + row.totalInstalmentAmount, 0),
      totalPaymentMade: schedule.reduce((sum, row) => sum + row.totalInstalmentAmount, 0) + deposit,
    };

    setFinancialYearGroups(groups);
    setTotals(newTotals);
  }, []);

  const recalculateScheduleFromIndex = (schedule: PaymentRow[], startIndex: number): PaymentRow[] => {
    const newSchedule = [...schedule];
    const monthlyInterestRate = interestRate / 100 / 12;
  
    // Step 1: Recalculate the edited month and determine the new outstanding principal
    const editedItemIndex = startIndex;
    const previousOutstandingPrincipal = editedItemIndex === 0
      ? totalCost - depositAmount
      : newSchedule[editedItemIndex - 1].outstandingPrincipal;
  
    const editedItem = { ...newSchedule[editedItemIndex] };
    const interestForEditedMonth = previousOutstandingPrincipal * monthlyInterestRate;
    const principalForEditedMonth = editedItem.totalInstalmentAmount - interestForEditedMonth;
  
    editedItem.interestAmount = Math.round(interestForEditedMonth * 100) / 100;
    editedItem.principalAmount = Math.round(principalForEditedMonth * 100) / 100;
    editedItem.outstandingPrincipal = Math.round((previousOutstandingPrincipal - editedItem.principalAmount) * 100) / 100;
    newSchedule[editedItemIndex] = editedItem;
  
    // Step 2: If there are subsequent months, recalculate a new equal payment for them
    const remainingInstalments = newSchedule.length - (startIndex + 1);
    if (remainingInstalments > 0) {
      const newFinancedAmount = editedItem.outstandingPrincipal;
  
      // Standard amortization formula for the remaining balance
      const newMonthlyPayment = newFinancedAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, remainingInstalments)) /
                                (Math.pow(1 + monthlyInterestRate, remainingInstalments) - 1);
  
      let currentOutstanding = newFinancedAmount;
      for (let i = startIndex + 1; i < newSchedule.length; i++) {
        const currentItem = { ...newSchedule[i] };
        const interestAmount = currentOutstanding * monthlyInterestRate;
        const principalAmount = newMonthlyPayment - interestAmount;
  
        currentItem.totalInstalmentAmount = Math.round(newMonthlyPayment * 100) / 100;
        currentItem.interestAmount = Math.round(interestAmount * 100) / 100;
        currentItem.principalAmount = Math.round(principalAmount * 100) / 100;
        currentOutstanding -= principalAmount;
        currentItem.outstandingPrincipal = Math.max(0, Math.round(currentOutstanding * 100) / 100);
  
        newSchedule[i] = currentItem;
      }
    }
  
    return newSchedule;
  };

  const updatePaymentSchedule = (ya: number, month: number, newAmount: number) => {
    setPaymentSchedule(prevSchedule => {
      const itemIndex = prevSchedule.findIndex(item => item.ya === ya && item.month === month);
      if (itemIndex === -1) return prevSchedule;
      
      const tempSchedule = [...prevSchedule];
      tempSchedule[itemIndex] = { ...tempSchedule[itemIndex], totalInstalmentAmount: newAmount };
      return recalculateScheduleFromIndex(tempSchedule, itemIndex);
    });
  };
  // Load payment schedule when data changes
  useEffect(() => {
    // Only run if the modal is open and has valid data
    if (numberOfInstalments > 0 && totalCost > 0 && startDate) {
      setIsLoading(true);
      hpPaymentService.loadPaymentSchedule({ depositAmount, interestRate, numberOfInstalments, totalCost, startDate }).then(data => {
        setPaymentSchedule(data.paymentSchedule);
        setOriginalPaymentSchedule(data.paymentSchedule);
        setPristineSchedule(data.paymentSchedule); 
        processScheduleForDisplay(data.paymentSchedule, data.depositAmount);
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [depositAmount, interestRate, numberOfInstalments, totalCost, startDate]);

  useEffect(() => {
    if (paymentSchedule.length > 0) {
      processScheduleForDisplay(paymentSchedule, depositAmount);
    }
  }, [paymentSchedule, depositAmount, processScheduleForDisplay]);
  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
  };

  const resetPaymentSchedule = () => {
    setPaymentSchedule(pristineSchedule);
    setOriginalPaymentSchedule(pristineSchedule); 
    setIsEditMode(false); 
  };

  const toggleYearExpansion = (ya: number) => {
    setExpandedYears(prev => {
      const newSet = new Set(prev);
      newSet.has(ya) ? newSet.delete(ya) : newSet.add(ya);
      return newSet;
    });
  };

  const openEarlySettlement = () => setIsEarlySettlementOpen(true);

  const closeEarlySettlement = () => setIsEarlySettlementOpen(false);

  const applyEarlySettlement = async (settlementMonth: number, interestAmount: number) => {
    try {
      // Calculate the new schedule based on the *current* schedule, which may include manual edits.
      const settledSchedule = await hpPaymentService.calculateEarlySettlement(
        paymentSchedule,
        settlementMonth,
        interestAmount
      );
      
      // Update the displayed schedule to show the result
      setPaymentSchedule(settledSchedule);
      processScheduleForDisplay(settledSchedule, depositAmount);

    } catch (error) {
      console.error('Error calculating early settlement:', error);
      alert((error as Error).message);
    }
    setIsEarlySettlementOpen(false);
  };

  const savePaymentSchedule = async () => {
    try {
      const result = await hpPaymentService.savePaymentSchedule(paymentSchedule);
      if (result.success) {
        // The displayed schedule is now the new "original"
        setOriginalPaymentSchedule(paymentSchedule);
        setIsEditMode(false);
        alert(result.message);
      } else {
        alert('Failed to save schedule.');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('An error occurred while saving.');
    }
  };

  return {
    isLoading,
    isEditMode,
    paymentSchedule,
    financialYearGroups,
    totals,
    updatePaymentSchedule,
    expandedYears,
    isEarlySettlementOpen,
    toggleEditMode,
    toggleYearExpansion,
    resetPaymentSchedule,
    savePaymentSchedule,
    openEarlySettlement,
    closeEarlySettlement,
    applyEarlySettlement,
  };
};