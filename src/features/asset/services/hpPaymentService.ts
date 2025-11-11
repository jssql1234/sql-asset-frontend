export interface PaymentRow {
  ya: number;
  month: number; // Financial month within the YA (1-12)
  instalmentNumber: number; // Overall instalment number
  principalAmount: number;
  interestAmount: number;
  totalInstalmentAmount: number;
  outstandingPrincipal: number;
}

export interface FinancialYearGroup {
  ya: number;
  months: PaymentRow[];
}

export interface HPPaymentTotals {
  totalInstalments: number;
  totalPrincipal: number;
  totalInterest: number;
  totalInstalmentAmount: number;
  totalPaymentMade: number; // instalments + deposit
}

export interface HPPaymentData {
  depositAmount: number;
  interestRate: number;
  numberOfInstalments: number;
  totalCost: number;
  startDate: string;
  paymentSchedule: PaymentRow[];
  financialYearGroups: FinancialYearGroup[];
  financialStartDate: string; // Global financial year start date (e.g., "01-01" for Jan 1st)
  totals: HPPaymentTotals;
}

export interface LoadPaymentScheduleParams {
  depositAmount: number;
  interestRate: number;
  numberOfInstalments: number;
  totalCost: number;
  startDate: string;
}

/**
 * Mock service for HP payment calculations
 * TODO: Replace with actual backend API calls when available
 */
export const hpPaymentService = {

  loadPaymentSchedule(params: LoadPaymentScheduleParams): Promise<HPPaymentData> {
    const { depositAmount, interestRate, numberOfInstalments, totalCost, startDate } = params;

    // TODO: Get from global settings when implemented
    const financialStartDate = "01-01"; // Default to Jan 1st as financial year start

    // Mock calculation - simplified amortization formula
    // TODO: Replace with actual backend calculation logic
    const financedAmount = totalCost - depositAmount;
    const monthlyInterestRate = interestRate / 100 / 12;

    // Simple monthly payment calculation (approximate)
    const monthlyPayment = financedAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfInstalments)) /
                          (Math.pow(1 + monthlyInterestRate, numberOfInstalments) - 1);

    const paymentSchedule: PaymentRow[] = [];
    let outstandingPrincipal = financedAmount;

    // Calculate financial year and month for each instalment
    const startDateObj = new Date(startDate);
    const [fsdMonth, fsdDay] = financialStartDate.split('-').map(Number);
    const fsdMonthIndex = fsdMonth - 1; // Convert to 0-based

    for (let i = 1; i <= numberOfInstalments; i++) {
      const interestAmount = outstandingPrincipal * monthlyInterestRate;
      const principalAmount = monthlyPayment - interestAmount;
      outstandingPrincipal -= principalAmount;

      // Calculate financial year and month for this instalment
      const instalmentDate = new Date(startDateObj);
      instalmentDate.setMonth(startDateObj.getMonth() + (i - 1));

      // Determine financial year
      let financialYear = instalmentDate.getFullYear();
      let financialMonth = instalmentDate.getMonth() + 1; // 1-based

      // Adjust for financial year start date
      if (instalmentDate.getMonth() < fsdMonthIndex ||
          (instalmentDate.getMonth() === fsdMonthIndex && instalmentDate.getDate() < fsdDay)) {
        financialYear -= 1;
        financialMonth = instalmentDate.getMonth() + 1 + (12 - fsdMonthIndex);
      } else {
        financialMonth = instalmentDate.getMonth() - fsdMonthIndex + 1;
      }

      paymentSchedule.push({
        ya: financialYear,
        month: financialMonth,
        instalmentNumber: i,
        principalAmount: Math.round(principalAmount * 100) / 100,
        interestAmount: Math.round(interestAmount * 100) / 100,
        totalInstalmentAmount: Math.round(monthlyPayment * 100) / 100,
        outstandingPrincipal: Math.round(Math.max(0, outstandingPrincipal) * 100) / 100,
      });
    }

    // Group by financial year for dropdown structure
    const financialYearGroups = paymentSchedule.reduce((groups: FinancialYearGroup[], row) => {
      const existingGroup = groups.find(g => g.ya === row.ya);
      if (existingGroup) {
        existingGroup.months.push(row);
      } else {
        groups.push({
          ya: row.ya,
          months: [row]
        });
      }
      return groups;
    }, []);

    // Calculate totals
    const totals: HPPaymentTotals = {
      totalInstalments: paymentSchedule.length,
      totalPrincipal: paymentSchedule.reduce((sum, row) => sum + row.principalAmount, 0),
      totalInterest: paymentSchedule.reduce((sum, row) => sum + row.interestAmount, 0),
      totalInstalmentAmount: paymentSchedule.reduce((sum, row) => sum + row.totalInstalmentAmount, 0),
      totalPaymentMade: paymentSchedule.reduce((sum, row) => sum + row.totalInstalmentAmount, 0) + depositAmount,
    };

    return Promise.resolve({
      depositAmount,
      interestRate,
      numberOfInstalments,
      totalCost,
      startDate,
      paymentSchedule,
      financialYearGroups,
      financialStartDate,
      totals,
    });
  },

  /**
   * Save payment schedule changes
   * TODO: Implement actual save logic when backend is available
   */
  async savePaymentSchedule(schedule: PaymentRow[]): Promise<{ success: boolean; message?: string }> {
    // Mock save operation
    console.log('Saving payment schedule:', schedule);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      message: 'Payment schedule saved successfully'
    };
  },

  /**
   * Calculate early settlement
   * TODO: Implement when backend calculation is available
   */
  calculateEarlySettlement(
    originalSchedule: PaymentRow[],
    settlementMonth: number, // This is the instalmentNumber (1-based)
    settlementInterestAmount: number
  ): Promise<PaymentRow[]> {
    // Create a deep copy to avoid modifying the original schedule
    const newSchedule = JSON.parse(JSON.stringify(originalSchedule));
    const settlementIndex = settlementMonth - 1;

    if (settlementIndex < 0 || settlementIndex >= newSchedule.length) {
      return Promise.reject(new Error("Invalid settlement month"));
    }

    // Find the total principal unpaid. This is the outstanding principal from the month *before* settlement.
    // If settling in the first month, it's the total of all principal amounts.
    const totalPrincipalUnpaid = settlementIndex === 0
      ? newSchedule.reduce((sum: number, row: PaymentRow) => sum + row.principalAmount, 0)
      : newSchedule[settlementIndex - 1].outstandingPrincipal;

    // Update the settlement month's payment details
    const settlementRow = newSchedule[settlementIndex];
    settlementRow.principalAmount = totalPrincipalUnpaid;
    settlementRow.interestAmount = settlementInterestAmount;
    settlementRow.totalInstalmentAmount = totalPrincipalUnpaid + settlementInterestAmount;
    settlementRow.outstandingPrincipal = 0;

    // Zero out all payments for the months following the settlement
    for (let i = settlementMonth; i < newSchedule.length; i++) {
      const futureRow = newSchedule[i];
      futureRow.principalAmount = 0;
      futureRow.interestAmount = 0;
      futureRow.totalInstalmentAmount = 0;
      futureRow.outstandingPrincipal = 0;
    }

    return Promise.resolve(newSchedule);
  }
};