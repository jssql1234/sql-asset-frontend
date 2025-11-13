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
  hasCustomSchedule: boolean; 
  pristineSchedule: PaymentRow[]
}

export interface LoadPaymentScheduleParams {
  depositAmount: number;
  interestRate: number;
  numberOfInstalments: number;
  totalCost: number;
  startDate: string;
  assetId?: string; 
}

// NEW: In-memory storage for saved schedules (replace with actual backend)
const savedSchedules = new Map<string, { 
  schedule: PaymentRow[], 
  params: LoadPaymentScheduleParams,
  pristineSchedule: PaymentRow[] // Store the original calculated schedule too
}>();

/**
 * Mock service for HP payment calculations
 * TODO: Replace with actual backend API calls when available
 */
export const hpPaymentService = {

  /**
   * Generate a unique key for caching schedules based on calculation parameters
   */
  generateScheduleKey(params: LoadPaymentScheduleParams): string {
    const { depositAmount, interestRate, numberOfInstalments, totalCost, startDate } = params;
    return `${depositAmount}-${interestRate}-${numberOfInstalments}-${totalCost}-${startDate}`;
  },

  /**
   * Check if the calculation parameters have changed
   */
  hasParametersChanged(savedParams: LoadPaymentScheduleParams, newParams: LoadPaymentScheduleParams): boolean {
    const changed = (
      Math.abs(savedParams.depositAmount - newParams.depositAmount) > 0.01 ||
      Math.abs(savedParams.interestRate - newParams.interestRate) > 0.001 ||
      savedParams.numberOfInstalments !== newParams.numberOfInstalments ||
      Math.abs(savedParams.totalCost - newParams.totalCost) > 0.01 ||
      savedParams.startDate !== newParams.startDate
    );
    
    // Debug logging
    if (changed) {
      console.log('🔄 Parameters changed, will recalculate:');
      console.log('Saved:', savedParams);
      console.log('New:', newParams);
    } else {
      console.log('✅ Parameters unchanged, using saved schedule');
    }
    
    return changed;
  },

  loadPaymentSchedule(params: LoadPaymentScheduleParams): Promise<HPPaymentData> {
    const { depositAmount, interestRate, numberOfInstalments, totalCost, startDate, assetId } = params;

    console.log('🔍 Loading payment schedule for asset:', assetId);
    console.log('📊 Has saved schedule?', assetId && savedSchedules.has(assetId));
    
    if (assetId && savedSchedules.has(assetId)) {
      console.log('💾 Found saved schedule in storage');
      const saved = savedSchedules.get(assetId)!;
      console.log('Saved params:', saved.params);
      console.log('New params:', params);
    }

    // TODO: Get from global settings when implemented
    const financialStartDate = "01-01"; // Default to Jan 1st as financial year start

    // Mock calculation - simplified amortization formula
    // TODO: Replace with actual backend calculation logic

    let paymentSchedule: PaymentRow[];
    let pristineSchedule: PaymentRow[];
    let hasCustomSchedule = false;

    // Check if we have a saved schedule for this asset
    if (assetId && savedSchedules.has(assetId)) {
      const saved = savedSchedules.get(assetId)!;
      
      // Check if calculation parameters have changed
      if (!this.hasParametersChanged(saved.params, params)) {
        // Parameters haven't changed, use saved schedule
        paymentSchedule = saved.schedule;
        pristineSchedule = saved.pristineSchedule;
        hasCustomSchedule = true;
        console.log('✅ Using saved custom schedule');
      } else {
        // Parameters changed, recalculate and clear saved schedule
        console.log('🗑️ Deleting saved schedule due to parameter change');
        savedSchedules.delete(assetId);
        const calculated = this.calculateSchedule(params, financialStartDate);
        paymentSchedule = calculated;
        pristineSchedule = calculated;
      }
    } else {
      // No saved schedule, calculate new one
      console.log('🆕 No saved schedule found, calculating fresh');
      const calculated = this.calculateSchedule(params, financialStartDate);
      paymentSchedule = calculated;
      pristineSchedule = calculated;
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
      totalInstalments: paymentSchedule.filter(r => r.totalInstalmentAmount > 0).length,
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
      hasCustomSchedule,
      pristineSchedule: pristineSchedule,
    });
  },

  /**
   * Calculate payment schedule using amortization formula
   */
  calculateSchedule(params: LoadPaymentScheduleParams, financialStartDate: string): PaymentRow[] {
    const { depositAmount, interestRate, numberOfInstalments, totalCost, startDate } = params;
    
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

    return paymentSchedule;
  },

  /**
   * Save payment schedule changes
    * TODO: Implement actual save logic when backend is available
   */
  savePaymentSchedule(
    schedule: PaymentRow[], 
    params: LoadPaymentScheduleParams
  ): Promise<{ success: boolean; message?: string }> {
    const { assetId } = params;
    
    console.log('💾 Attempting to save schedule for assetId:', assetId);
    
    if (!assetId) {
      return Promise.resolve({
        success: false,
        message: 'Asset ID is required to save schedule'
      });
    }

    // Calculate the pristine schedule to store alongside the custom one
    const financialStartDate = "01-01";
    const pristineSchedule = this.calculateSchedule(params, financialStartDate);

    // TODO: Replace with actual backend API call
    console.log('Saving payment schedule for asset:', assetId, schedule);

    // Save to in-memory storage (replace with actual backend)
    savedSchedules.set(assetId, {
      schedule: JSON.parse(JSON.stringify(schedule)), // Deep copy of custom schedule
      pristineSchedule: pristineSchedule, // Original calculated schedule
      params: { ...params }
    });
    
    console.log('✅ Saved! Current storage keys:', Array.from(savedSchedules.keys()));
    console.log('📦 Storage size:', savedSchedules.size);

    // Simulate API delay and return promise
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Payment schedule saved successfully'
        });
      }, 500);
    });
  },

  /**
   * Transfer saved schedule from temporary ID to real asset ID
   * Call this after creating a new asset to preserve the HP schedule
   */
  transferSchedule(fromAssetId: string, toAssetId: string): void {
    console.log(`🔄 Transferring schedule from ${fromAssetId} to ${toAssetId}`);
    
    if (savedSchedules.has(fromAssetId)) {
      const savedData = savedSchedules.get(fromAssetId)!;
      
      // Update the params with the new asset ID
      savedData.params.assetId = toAssetId;
      
      // Save under the new ID
      savedSchedules.set(toAssetId, savedData);
      
      // Delete the temp ID entry
      savedSchedules.delete(fromAssetId);
      
      console.log('✅ Schedule transferred successfully');
      console.log('📦 Current storage keys:', Array.from(savedSchedules.keys()));
    } else {
      console.log('⚠️ No schedule found for temp ID');
    }
  },

  /**
   * Calculate early settlement
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