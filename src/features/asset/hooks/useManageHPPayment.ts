import { useState, useEffect } from 'react';
import type { PaymentRow, FinancialYearGroup } from '../services/hpPaymentService';

export interface UseManageHPPaymentProps {
  depositAmount: number;
  interestRate: number;
  numberOfInstalments: number;
  totalCost: number;
  startDate: string;
}

export const useManageHPPayment = ({
  depositAmount,
  interestRate,
  numberOfInstalments,
  totalCost,
  startDate,
}: UseManageHPPaymentProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentRow[]>([]);
  const [originalPaymentSchedule, setOriginalPaymentSchedule] = useState<PaymentRow[]>([]);
  const [financialYearGroups, setFinancialYearGroups] = useState<FinancialYearGroup[]>([]);
  const [totals, setTotals] = useState<{ totalInstalments: number; totalPrincipal: number; totalInterest: number; totalInstalmentAmount: number; totalPaymentMade: number } | null>(null);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(() => new Set()); // Track expanded YA groups
  const [isEarlySettlementOpen, setIsEarlySettlementOpen] = useState(false);

  // Load payment schedule when data changes
  useEffect(() => {
    const calculateFallbackSchedule = (): PaymentRow[] => {
      const financedAmount = totalCost - depositAmount;
      const monthlyInterestRate = interestRate / 100 / 12;
      const monthlyPayment = financedAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfInstalments)) / (Math.pow(1 + monthlyInterestRate, numberOfInstalments) - 1);

      const schedule: PaymentRow[] = [];
      let outstandingPrincipal = financedAmount;
      let currentYear = new Date(startDate).getFullYear();
      let instalmentInYear = 1;

      for (let i = 1; i <= numberOfInstalments; i++) {
        const interestAmount = outstandingPrincipal * monthlyInterestRate;
        const principalAmount = monthlyPayment - interestAmount;
        outstandingPrincipal -= principalAmount;

        // Check if we need to move to next year (every 12 months)
        if (i > 1 && (i - 1) % 12 === 0) {
          currentYear++;
          instalmentInYear = 1;
        }

        schedule.push({
          ya: currentYear,
          month: instalmentInYear, // Fallback: use instalment number as month
          instalmentNumber: i,
          principalAmount: Math.round(principalAmount * 100) / 100,
          interestAmount: Math.round(interestAmount * 100) / 100,
          totalInstalmentAmount: Math.round(monthlyPayment * 100) / 100,
          outstandingPrincipal: Math.round(Math.max(0, outstandingPrincipal) * 100) / 100,
        });

        instalmentInYear++;
      }

      return schedule;
    };

    const loadPaymentSchedule = async () => {
      try {
        const { hpPaymentService } = await import('../services/hpPaymentService');
        const data = await hpPaymentService.loadPaymentSchedule({
          depositAmount,
          interestRate,
          numberOfInstalments,
          totalCost,
          startDate,
        });

        setPaymentSchedule(data.paymentSchedule);
        setOriginalPaymentSchedule([...data.paymentSchedule]);
        setFinancialYearGroups(data.financialYearGroups);
        setTotals(data.totals);
      } catch (error) {
        console.error('Failed to load payment schedule:', error);
        // Fallback to basic calculation if service fails
        const schedule = calculateFallbackSchedule();
        setPaymentSchedule(schedule);
        setOriginalPaymentSchedule([...schedule]);

        // Calculate fallback totals
        const fallbackTotals = {
          totalInstalments: schedule.length,
          totalPrincipal: schedule.reduce((sum, row) => sum + row.principalAmount, 0),
          totalInterest: schedule.reduce((sum, row) => sum + row.interestAmount, 0),
          totalInstalmentAmount: schedule.reduce((sum, row) => sum + row.totalInstalmentAmount, 0),
          totalPaymentMade: schedule.reduce((sum, row) => sum + row.totalInstalmentAmount, 0) + depositAmount,
        };
        setTotals(fallbackTotals);
      }
    };

    if (depositAmount && interestRate && numberOfInstalments && totalCost && startDate) {
      void loadPaymentSchedule();
    }
  }, [depositAmount, interestRate, numberOfInstalments, totalCost, startDate]);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const resetPaymentSchedule = () => {
    setPaymentSchedule([...originalPaymentSchedule]);
    setIsEditMode(false);
  };

  const toggleYearExpansion = (ya: number) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(ya)) {
      newExpanded.delete(ya);
    } else {
      newExpanded.add(ya);
    }
    setExpandedYears(newExpanded);
  };

  const openEarlySettlement = () => {
    setIsEarlySettlementOpen(true);
  };

  const closeEarlySettlement = () => {
    setIsEarlySettlementOpen(false);
  };

  const applyEarlySettlement = (settlementMonth: number, interestAmount: number) => {
    // Apply early settlement logic
    const newSchedule = [...paymentSchedule];
    for (let i = settlementMonth; i < newSchedule.length; i++) {
      newSchedule[i] = {
        ...newSchedule[i],
        principalAmount: 0,
        interestAmount: 0,
        totalInstalmentAmount: 0,
        outstandingPrincipal: 0,
      };
    }
    setPaymentSchedule(newSchedule);
    setIsEarlySettlementOpen(false);
  };

  const savePaymentSchedule = () => {
    // TODO: Implement save functionality
    console.log('Saving payment schedule:', paymentSchedule);
    setIsEditMode(false);
  };

  return {
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