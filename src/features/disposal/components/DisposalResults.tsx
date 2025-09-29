import React from 'react';
import { Button } from '@/components/ui/components';
import Card from '@/components/ui/components/Card';

// Type definitions for disposal results
interface AssetData {
  assetCode: string;
  assetDescription: string;
  originalCost: number;
  qualifyingExpenditure: number;
  residualExpenditure: number;
  totalCAClaimed: number;
  purchaseDate: string;
  disposalDate: string;
}

interface DisposalCalculationResults {
  balancingAllowance: number;
  balancingCharge: number;
  totalCAClaimed: number;
  taxTreatment: string;
  clawbackAmount?: number;
  netTaxEffect: number;
  disposedCost: number;
  disposalValue: number;
  remainingCost: number;
  proportion: number;
  disposedQE: number;
  disposedRE: number;
  deemedProceeds: number;
}

interface DisposalResultsProps {
  assetData: AssetData;
  disposalType: string;
  calculationResults: DisposalCalculationResults;
  isClawbackApplicable?: boolean;
  onClawbackChange?: (isApplicable: boolean) => void;
  onConfirm: () => void;
  onPrevious: () => void;
  isConfirmed?: boolean;
  readOnly?: boolean;
}

const DisposalResults: React.FC<DisposalResultsProps> = ({
  assetData,
  disposalType,
  calculationResults,
  isClawbackApplicable = false,
  onClawbackChange,
  onConfirm,
  onPrevious,
  isConfirmed = false,
  readOnly = false,
}) => {
  // Helper function to format disposal type display
  const formatDisposalType = (type: string): string => {
    switch (type) {
      case 'partial':
        return 'Normal';
      case 'mfrs5':
        return 'MFRS5';
      case 'gift':
        return 'Gift';
      case 'agriculture':
        return 'Agriculture';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return `RM ${amount.toFixed(2)}`;
  };

  // Helper function to format percentage
  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <Card className="space-y-8">
      <div className="border-b border-outlineVariant pb-6">
        <h3 className="text-2xl font-bold text-onBackground">Disposal Results</h3>
        <p className="text-onSurface mt-2">Review and confirm disposal results</p>
      </div>

      {/* Calculation Summary Section */}
      <div className="space-y-6">
        <h4 className="text-xl font-semibold text-onBackground flex items-center">
          <div className="w-1 h-6 bg-primary mr-3 rounded-full"></div>
          Calculation Summary
        </h4>
        
        <div className="bg-white border border-outline rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Financial Overview */}
            <div className="space-y-4">
              <h5 className="font-medium text-primary text-sm uppercase tracking-wide border-b border-primary/20 pb-2">Financial Overview</h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-onSurface">Original Cost</span>
                  <span className="font-semibold text-onBackground">{formatCurrency(assetData.originalCost)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-onSurface">Disposed Cost</span>
                  <span className="font-semibold text-onBackground">{formatCurrency(calculationResults.disposedCost)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-onSurface">Remaining Cost</span>
                  <span className="font-semibold text-onBackground">{formatCurrency(calculationResults.remainingCost)}</span>
                </div>
              </div>
            </div>

            {/* Disposal Details */}
            <div className="space-y-4">
              <h5 className="font-medium text-primary text-sm uppercase tracking-wide border-b border-primary/20 pb-2">Disposal Details</h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-onSurface">Disposal Value</span>
                  <span className="font-semibold text-onBackground">{formatCurrency(calculationResults.disposalValue)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-onSurface">Proportion</span>
                  <span className="font-semibold text-onBackground">{formatPercentage(calculationResults.proportion)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-onSurface">Deemed Proceeds</span>
                  <span className="font-semibold text-onBackground">{formatCurrency(calculationResults.deemedProceeds)}</span>
                </div>
              </div>
            </div>

            {/* Allowances */}
            <div className="space-y-4">
              <h5 className="font-medium text-primary text-sm uppercase tracking-wide border-b border-primary/20 pb-2">Allowances</h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-onSurface">Disposed QE</span>
                  <span className="font-semibold text-onBackground">{formatCurrency(calculationResults.disposedQE)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-onSurface">Disposed RE</span>
                  <span className="font-semibold text-onBackground">{formatCurrency(calculationResults.disposedRE)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-onSurface">Total CA Claimed</span>
                  <span className="font-semibold text-onBackground">{formatCurrency(calculationResults.totalCAClaimed)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Information Section */}
      <div className="space-y-6">
        <h4 className="text-xl font-semibold text-onBackground flex items-center">
          <div className="w-1 h-6 bg-primary mr-3 rounded-full"></div>
          Asset Information
        </h4>
        
        <div className="bg-white border border-outline rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-onSurface text-sm mb-2">Asset ID</div>
              <div className="font-semibold text-lg text-onBackground">{assetData.assetCode}</div>
            </div>
            <div className="text-center">
              <div className="text-onSurface text-sm mb-2">Disposal Type</div>
              <div className="font-semibold text-lg text-onBackground">{formatDisposalType(disposalType)}</div>
            </div>
            <div className="text-center">
              <div className="text-onSurface text-sm mb-2">Acquire Date</div>
              <div className="font-semibold text-lg text-onBackground">{assetData.purchaseDate || 'N/A'}</div>
            </div>
            <div className="text-center">
              <div className="text-onSurface text-sm mb-2">Disposal Date</div>
              <div className="font-semibold text-lg text-onBackground">{assetData.disposalDate || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Impact Section */}
      <div className="space-y-6">
        <h4 className="text-xl font-semibold text-onBackground flex items-center">
          <div className="w-1 h-6 bg-primary mr-3 rounded-full"></div>
          Tax Impact
        </h4>
        
        <div className="bg-white border border-outline rounded-xl p-6 shadow-sm">
          <div className="space-y-6">
            {/* Tax Treatment */}
            <div className="bg-surfaceContainer rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-onSurface font-medium">Tax Treatment</span>
                <span className="font-semibold text-lg text-onBackground px-3 py-1 bg-primary/10 rounded-lg">
                  {calculationResults.taxTreatment}
                </span>
              </div>
            </div>

            {/* Balancing Allowance/Charge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {calculationResults.balancingAllowance > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-green-700 text-sm font-medium mb-2">Balancing Allowance</div>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(calculationResults.balancingAllowance)}</div>
                  </div>
                </div>
              )}
              {calculationResults.balancingCharge > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-red-700 text-sm font-medium mb-2">Balancing Charge</div>
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(calculationResults.balancingCharge)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Clawback Checkbox */}
            {!readOnly && onClawbackChange && (
              <div className="bg-surfaceContainer rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <input
                    type="checkbox"
                    id="clawback-applicable"
                    checked={isClawbackApplicable}
                    onChange={(e) => onClawbackChange(e.target.checked)}
                    className="w-5 h-5 text-primary border-outlineVariant focus:ring-primary rounded"
                  />
                  <label htmlFor="clawback-applicable" className="font-medium text-onBackground">
                    Clawback: Asset disposed within {disposalType === 'agriculture' ? '5' : '2'} years of acquisition
                  </label>
                </div>
                {isClawbackApplicable && calculationResults.clawbackAmount && (
                  <div className="mt-4 pt-4 border-t border-outline">
                    <div className="flex justify-between items-center">
                      <span className="text-onSurface font-medium">Clawback Amount</span>
                      <span className="font-bold text-lg text-red-600">{formatCurrency(calculationResults.clawbackAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!readOnly && (
        <div className={`flex pt-6 ${isConfirmed ? 'justify-end' : 'justify-between'}`}>
          {!isConfirmed && (
            <Button variant="outline" onClick={onPrevious} className="px-8 py-3">
              Previous
            </Button>
          )}
          <Button
            onClick={onConfirm}
            disabled={isConfirmed}
            className={`px-8 py-3 ${isConfirmed ? 'bg-green-600 text-white' : ''}`}
          >
            {isConfirmed ? 'Confirmed ✓' : 'Confirm Disposal'}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default DisposalResults;
