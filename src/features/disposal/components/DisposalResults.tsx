import React from 'react';
import { Button } from '@/components/ui/components';
import Card from '@/components/ui/components/Card';

// Type definitions for disposal results
interface AssetData {
  assetId: string;
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
  annualAllowance?: number;
  apportionedAllowance?: number;
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
              <div className="font-semibold text-lg text-onBackground">{assetData.assetId}</div>
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

      {/* Calculation Summary Section */}
      <div className="space-y-6">
        <h4 className="text-xl font-semibold text-onBackground flex items-center">
          <div className="w-1 h-6 bg-primary mr-3 rounded-full"></div>
          Calculation Summary
        </h4>
        
        <div className="bg-white border-2 border-outline rounded-xl overflow-hidden shadow-sm">
          {/* Table Body */}
          <div>
            {/* Financial Overview Section */}
            <div className="bg-surfaceContainer/20 border-b-2 border-outline">
              <table className="w-full">
                <tbody>
                  <tr className="border-b-2 border-outline">
                    <td rowSpan={3} className="w-1/4 px-6 py-4 align-middle border-r-2 border-outline">
                      <div className="flex items-center justify-center h-full">
                        <span className="font-medium text-onBackground text-center">Financial Overview</span>
                      </div>
                    </td>
                    <td className="w-1/2 px-6 py-3">
                      <span className="text-onSurface">Original Cost</span>
                    </td>
                    <td className="w-1/4 px-6 py-3 text-right">
                      <span className="font-semibold text-onBackground">{formatCurrency(assetData.originalCost)}</span>
                    </td>
                  </tr>
                  <tr className="border-b-2 border-outline">
                    <td className="px-6 py-3">
                      <span className="text-onSurface">Disposed Cost</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="font-semibold text-onBackground">{formatCurrency(calculationResults.disposedCost)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3">
                      <span className="text-onSurface">Remaining Cost</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="font-semibold text-onBackground">{formatCurrency(calculationResults.remainingCost)}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Disposal Details Section */}
            <div className="bg-surfaceContainer/20 border-b-2 border-outline">
              <table className="w-full">
                <tbody>
                  <tr className="border-b-2 border-outline">
                    <td rowSpan={3} className="w-1/4 px-6 py-4 align-middle border-r-2 border-outline">
                      <div className="flex items-center justify-center h-full">
                        <span className="font-medium text-onBackground text-center">Disposal Details</span>
                      </div>
                    </td>
                    <td className="w-1/2 px-6 py-3">
                      <span className="text-onSurface">Disposal Value</span>
                    </td>
                    <td className="w-1/4 px-6 py-3 text-right">
                      <span className="font-semibold text-onBackground">{formatCurrency(calculationResults.disposalValue)}</span>
                    </td>
                  </tr>
                  <tr className="border-b-2 border-outline">
                    <td className="px-6 py-3">
                      <span className="text-onSurface">Proportion</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="font-semibold text-onBackground">{formatPercentage(calculationResults.proportion)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3">
                      <span className="text-onSurface">Deemed Proceeds</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="font-semibold text-onBackground">{formatCurrency(calculationResults.deemedProceeds)}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Allowances Section - Dynamic based on disposal type */}
            <div className="bg-surfaceContainer/20">
              <table className="w-full">
                <tbody>
                  {disposalType === 'agriculture' ? (
                    <>
                      <tr className="border-b-2 border-outline">
                        <td rowSpan={3} className="w-1/4 px-6 py-4 align-middle border-r-2 border-outline">
                          <div className="flex items-center justify-center h-full">
                            <span className="font-medium text-onBackground text-center">Allowances</span>
                          </div>
                        </td>
                        <td className="w-1/2 px-6 py-3">
                          <span className="text-onSurface">Total CA Claimed</span>
                        </td>
                        <td className="w-1/4 px-6 py-3 text-right">
                          <span className="font-semibold text-onBackground">{formatCurrency(calculationResults.totalCAClaimed)}</span>
                        </td>
                      </tr>
                      <tr className="border-b-2 border-outline">
                        <td className="px-6 py-3">
                          <span className="text-onSurface">Annual Allowance</span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className="font-semibold text-onBackground">{formatCurrency(calculationResults.annualAllowance || 0)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3">
                          <span className="text-onSurface">Apportioned Allowance</span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className="font-semibold text-onBackground">{formatCurrency(calculationResults.apportionedAllowance || 0)}</span>
                        </td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr className="border-b-2 border-outline">
                        <td rowSpan={3} className="w-1/4 px-6 py-4 align-middle border-r-2 border-outline">
                          <div className="flex items-center justify-center h-full">
                            <span className="font-medium text-onBackground text-center">Allowances</span>
                          </div>
                        </td>
                        <td className="w-1/2 px-6 py-3">
                          <span className="text-onSurface">Disposed QE</span>
                        </td>
                        <td className="w-1/4 px-6 py-3 text-right">
                          <span className="font-semibold text-onBackground">{formatCurrency(calculationResults.disposedQE)}</span>
                        </td>
                      </tr>
                      <tr className="border-b-2 border-outline">
                        <td className="px-6 py-3">
                          <span className="text-onSurface">Disposed RE</span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className="font-semibold text-onBackground">{formatCurrency(calculationResults.disposedRE)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3">
                          <span className="text-onSurface">Total CA Claimed</span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className="font-semibold text-onBackground">{formatCurrency(calculationResults.totalCAClaimed)}</span>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
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
            {isConfirmed ? 'Confirmed' : 'Confirm Disposal'}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default DisposalResults;
