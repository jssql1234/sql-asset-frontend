// Disposal service API functions

// Types
export interface DisposalAssetData {
  assetCode: string;
  assetDescription: string;
  originalCost: number;
  qualifyingExpenditure: number;
  residualExpenditure: number;
  totalCAClaimed: number;
  purchaseDate: string;
  disposalDate: string;
}

export interface DisposalCalculationRequest {
  assetData: DisposalAssetData;
  disposalType: string;
  disposalCase: 'special' | 'normal';
  multipleAssetsData?: any[];
}

export interface DisposalCalculationResult {
  balancingAllowance: number;
  balancingCharge: number;
  writtenDownValue: number;
  taxTreatment: string;
  clawbackAmount?: number;
  netTaxEffect: number;
  workingSheetData?: any;
}

export interface DisposalHistoryItem {
  id: string;
  assetCode: string;
  disposalType: string;
  disposalDate: string;
  disposalValue: number;
  status: 'Draft' | 'Confirmed' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

// Mock data for development
const mockCalculationResults: DisposalCalculationResult = {
  balancingAllowance: 15000,
  balancingCharge: 0,
  writtenDownValue: 85000,
  taxTreatment: 'Balancing Allowance',
  netTaxEffect: 15000,
};

// Service functions
export const disposalService = {
  /**
   * Calculate disposal results
   */
  async calculateDisposal(request: DisposalCalculationRequest): Promise<DisposalCalculationResult> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock calculation logic based on disposal type
    const { assetData, disposalType } = request;
    const disposalValue = assetData.originalCost * 0.85; // Simplified calculation
    const writtenDownValue = assetData.originalCost - assetData.totalCAClaimed;
    
    if (disposalValue > writtenDownValue) {
      // Balancing charge
      return {
        ...mockCalculationResults,
        balancingCharge: disposalValue - writtenDownValue,
        balancingAllowance: 0,
        taxTreatment: 'Balancing Charge',
        netTaxEffect: -(disposalValue - writtenDownValue),
      };
    } else {
      // Balancing allowance
      return {
        ...mockCalculationResults,
        balancingAllowance: writtenDownValue - disposalValue,
        balancingCharge: 0,
        taxTreatment: 'Balancing Allowance',
        netTaxEffect: writtenDownValue - disposalValue,
      };
    }
  },

  /**
   * Get disposal history
   */
  async getDisposalHistory(): Promise<DisposalHistoryItem[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data
    return [
      {
        id: '1',
        assetCode: 'AS-0001',
        disposalType: 'partial',
        disposalDate: '2024-12-01',
        disposalValue: 85000,
        status: 'Confirmed',
        createdAt: '2024-11-15T10:30:00Z',
        updatedAt: '2024-12-01T14:20:00Z',
      },
      {
        id: '2',
        assetCode: 'AS-0002',
        disposalType: 'mfrs5',
        disposalDate: '2024-11-20',
        disposalValue: 125000,
        status: 'Draft',
        createdAt: '2024-11-20T09:15:00Z',
        updatedAt: '2024-11-20T09:15:00Z',
      },
    ];
  },

  /**
   * Save disposal
   */
  async saveDisposal(data: DisposalCalculationRequest): Promise<{ id: string; status: string }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      id: Date.now().toString(),
      status: 'saved',
    };
  },

  /**
   * Confirm disposal
   */
  async confirmDisposal(disposalId: string): Promise<{ status: string }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      status: 'confirmed',
    };
  },

  /**
   * Delete disposal
   */
  async deleteDisposal(disposalId: string): Promise<{ status: string }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      status: 'deleted',
    };
  },

  /**
   * Generate working sheet
   */
  async generateWorkingSheet(disposalId: string): Promise<Blob> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Return mock PDF blob
    const pdfContent = 'Mock PDF content for working sheet';
    return new Blob([pdfContent], { type: 'application/pdf' });
  },
};

export default disposalService;
