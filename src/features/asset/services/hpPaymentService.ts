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


export const hpPaymentService = {
  loadPaymentSchedule(params: LoadPaymentScheduleParams): Promise<HPPaymentData> {
    const { depositAmount, interestRate, numberOfInstalments, totalCost, startDate } = params;

    // TODO: Get from global settings when implemented
    const financialStartDate = "01-01"; // Default to Jan 1st as financial year start

    // Calculation based on flat-rate interest for Hire Purchase
    const financedAmount = totalCost - depositAmount;
    const termInYears = numberOfInstalments / 12;

    // 1. Calculate total interest using flat rate
    const totalInterest = financedAmount * (interestRate / 100) * termInYears;

    // 2. Calculate total amount to be repaid
    const totalRepayment = financedAmount + totalInterest;

    // 3. Calculate the constant monthly instalment
    const monthlyInstalment = totalRepayment / numberOfInstalments;

    // 4. Calculate the Sum of Digits for the Rule of 78s
    const sumOfDigits = (numberOfInstalments * (numberOfInstalments + 1)) / 2;
    
    const paymentSchedule: PaymentRow[] = [];
    let outstandingPrincipal = financedAmount;

    // Calculate financial year and month for each instalment
    const startDateObj = new Date(startDate);
    const [fsdMonth, fsdDay] = financialStartDate.split('-').map(Number);
    const fsdMonthIndex = fsdMonth - 1; // Convert to 0-based

    for (let i = 1; i <= numberOfInstalments; i++) {
      // Calculate interest for the current month using the Rule of 78s
      const remainingInstalments = numberOfInstalments - (i - 1);
      const interestForMonth = totalInterest * (remainingInstalments / sumOfDigits);
      const principalForMonth = monthlyInstalment - interestForMonth;

      outstandingPrincipal -= principalForMonth;
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
        principalAmount: Math.round(principalForMonth * 100) / 100,
        interestAmount: Math.round(interestForMonth * 100) / 100,
        totalInstalmentAmount: Math.round(monthlyInstalment * 100) / 100,
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
    settlementMonth: number
  ): Promise<PaymentRow[]> {
    // Mock early settlement calculation
    const newSchedule = [...originalSchedule];

    // Zero out payments after settlement month
    for (let i = settlementMonth; i < newSchedule.length; i++) {
      newSchedule[i] = {
        ...newSchedule[i],
        principalAmount: 0,
        interestAmount: 0,
        totalInstalmentAmount: 0,
        outstandingPrincipal: 0,
      };
    }

    return Promise.resolve(newSchedule);
  }
};