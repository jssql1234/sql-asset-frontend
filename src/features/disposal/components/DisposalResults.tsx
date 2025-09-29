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
  writtenDownValue: number;
  taxTreatment: string;
  clawbackAmount?: number;
  netTaxEffect: number;
  // Additional calculation fields
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
    <Card className="space-y-6">
      <div className="border-b border-outlineVariant pb-4">
        <h3 className="text-lg font-semibold text-onBackground">Disposal Results</h3>
        <p className="text-onSurface mt-1">Review and confirm disposal results</p>
      </div>

      {/* Calculation Summary Section */}
      <div className="bg-surfaceContainer rounded-lg p-6">
        <h4 className="font-medium text-onBackground mb-4">Calculation Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
            <span className="text-onSurface">Disposed Cost:</span>
            <span className="font-medium text-onBackground">{formatCurrency(calculationResults.disposedCost)}</span>
          </div>
          <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
            <span className="text-onSurface">Original Cost:</span>
            <span className="font-medium text-onBackground">{formatCurrency(assetData.originalCost)}</span>
          </div>
          <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
            <span className="text-onSurface">Disposal Value:</span>
            <span className="font-medium text-onBackground">{formatCurrency(calculationResults.disposalValue)}</span>
          </div>
          <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
            <span className="text-onSurface">Remaining Cost:</span>
            <span className="font-medium text-onBackground">{formatCurrency(calculationResults.remainingCost)}</span>
          </div>
          <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
            <span className="text-onSurface">Proportion:</span>
            <span className="font-medium text-onBackground">{formatPercentage(calculationResults.proportion)}</span>
          </div>
          <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
            <span className="text-onSurface">Disposed QE:</span>
            <span className="font-medium text-onBackground">{formatCurrency(calculationResults.disposedQE)}</span>
          </div>
          <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
            <span className="text-onSurface">Disposed RE:</span>
            <span className="font-medium text-onBackground">{formatCurrency(calculationResults.disposedRE)}</span>
          </div>
          <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
            <span className="text-onSurface">Deemed Proceeds:</span>
            <span className="font-medium text-onBackground">{formatCurrency(calculationResults.deemedProceeds)}</span>
          </div>
          <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
            <span className="text-onSurface">Written Down Value:</span>
            <span className="font-medium text-onBackground">{formatCurrency(calculationResults.writtenDownValue)}</span>
          </div>
        </div>
      </div>

      {/* Asset Information Section */}
      <div className="bg-surfaceContainer rounded-lg p-6">
        <h4 className="font-medium text-onBackground mb-4">Asset Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
            <span className="text-onSurface">Asset ID:</span>
            <span className="font-medium text-onBackground">{assetData.assetCode}</span>
          </div>
          <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
            <span className="text-onSurface">Disposal Type:</span>
            <span className="font-medium text-onBackground">{formatDisposalType(disposalType)}</span>
          </div>
          <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
            <span className="text-onSurface">Acquire Date:</span>
            <span className="font-medium text-onBackground">{assetData.purchaseDate || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
            <span className="text-onSurface">Disposal Date:</span>
            <span className="font-medium text-onBackground">{assetData.disposalDate || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Tax Impact Section */}
      <div className="bg-surfaceContainer rounded-lg p-6">
        <h4 className="font-medium text-onBackground mb-4">Tax Impact</h4>
        <div className="space-y-4">
          {/* Tax Treatment */}
          <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
            <span className="text-onSurface">Tax Treatment:</span>
            <span className="font-medium text-onBackground">{calculationResults.taxTreatment}</span>
          </div>

          {/* Balancing Allowance/Charge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calculationResults.balancingAllowance > 0 && (
              <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
                <span className="text-onSurface">Balancing Allowance:</span>
                <span className="font-medium text-green-600">{formatCurrency(calculationResults.balancingAllowance)}</span>
              </div>
            )}
            {calculationResults.balancingCharge > 0 && (
              <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
                <span className="text-onSurface">Balancing Charge:</span>
                <span className="font-medium text-red-600">{formatCurrency(calculationResults.balancingCharge)}</span>
              </div>
            )}
          </div>

          {/* Clawback Checkbox */}
          {!readOnly && onClawbackChange && (
            <div className="border border-outline rounded-md p-4 bg-white">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="clawback-applicable"
                  checked={isClawbackApplicable}
                  onChange={(e) => onClawbackChange(e.target.checked)}
                  className="w-4 h-4 text-primary border-outlineVariant focus:ring-primary rounded"
                />
                <label htmlFor="clawback-applicable" className="text-sm text-onSurface">
                  Clawback Applicable
                </label>
              </div>
              {isClawbackApplicable && calculationResults.clawbackAmount && (
                <div className="mt-2 pt-2 border-t border-outline">
                  <div className="flex justify-between text-sm">
                    <span className="text-onSurface">Clawback Amount:</span>
                    <span className="font-medium text-red-600">{formatCurrency(calculationResults.clawbackAmount)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {!readOnly && (
        <div className={`flex pt-4 ${isConfirmed ? 'justify-end' : 'justify-between'}`}>
          {!isConfirmed && (
            <Button variant="outline" onClick={onPrevious}>
              Previous
            </Button>
          )}
          <Button
            onClick={onConfirm}
            disabled={isConfirmed}
            className={isConfirmed ? 'bg-green-600 text-white' : ''}
          >
            {isConfirmed ? 'Confirmed ✓' : 'Confirm Disposal'}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default DisposalResults;
