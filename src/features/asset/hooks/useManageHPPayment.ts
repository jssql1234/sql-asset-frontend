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
  const [originalPaymentSchedule, setOriginalPaymentSchedule] = useState<PaymentRow[]>([]);
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

  // Load payment schedule when data changes
  useEffect(() => {
    // Only run if the modal is open and has valid data
    if (numberOfInstalments > 0 && totalCost > 0 && startDate) {
      setIsLoading(true);
      hpPaymentService.loadPaymentSchedule({ depositAmount, interestRate, numberOfInstalments, totalCost, startDate }).then(data => {
        setPaymentSchedule(data.paymentSchedule);
        setOriginalPaymentSchedule(data.paymentSchedule);
        processScheduleForDisplay(data.paymentSchedule, data.depositAmount);
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [depositAmount, interestRate, numberOfInstalments, totalCost, startDate]);

  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
  };

  const resetPaymentSchedule = () => {
    setPaymentSchedule(originalPaymentSchedule);
    processScheduleForDisplay(originalPaymentSchedule, depositAmount);
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
      // Calculate the new schedule based on the original, last-saved schedule
      const settledSchedule = await hpPaymentService.calculateEarlySettlement(
        originalPaymentSchedule,
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