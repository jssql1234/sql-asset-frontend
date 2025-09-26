import React from 'react';
import { Button } from '@/components/ui/components';
import Card from '@/components/ui/components/Card';

interface DisposalAssetData {
  assetId: string;
  assetDescription: string;
  originalCost: number;
  disposalValue: number;
  disposalDate: string;
  acquireDate: string;
  disposalType: string;
  recipient?: string;
}

interface DisposalCalculationResults {
  balancingAllowance: number;
  balancingCharge: number;
  writtenDownValue: number;
  taxTreatment: string;
  clawbackAmount?: number;
  netTaxEffect: number;
}

interface DisposalSummaryProps {
  assetData: DisposalAssetData | DisposalAssetData[];
  calculationResults: DisposalCalculationResults;
  disposalType: string;
  isMultipleAssets?: boolean;
  onConfirm: () => void;
  onEdit: () => void;
  onCancel: () => void;
  isConfirming?: boolean;
  showWorkingSheet?: boolean;
  onViewWorkingSheet?: () => void;
}

const DisposalSummary: React.FC<DisposalSummaryProps> = ({
  assetData,
  calculationResults,
  disposalType,
  isMultipleAssets = false,
  onConfirm,
  onEdit,
  onCancel,
  isConfirming = false,
  showWorkingSheet = true,
  onViewWorkingSheet,
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDisposalTypeLabel = (type: string): string => {
    const typeLabels: Record<string, string> = {
      'partial': 'Partial Disposal',
      'mfrs5': 'MFRS 5 Held-for-Sale',
      'gift': 'Gift to Approved Institutions',
      'agriculture': 'Agriculture Disposal',
      'normal': 'Normal Disposal',
      'controlled': 'Controlled Disposal',
      'written-off': 'Written Off',
    };
    return typeLabels[type] || type;
  };

  const getTaxTreatmentBadge = (treatment: string) => {
    const isCharge = treatment.toLowerCase().includes('charge');
    const isAllowance = treatment.toLowerCase().includes('allowance');
    
    if (isCharge) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          {treatment}
        </span>
      );
    } else if (isAllowance) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {treatment}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          {treatment}
        </span>
      );
    }
  };

  const renderAssetInformation = () => {
    if (isMultipleAssets && Array.isArray(assetData)) {
      return (
        <Card className="space-y-4">
          <h4 className="font-medium text-onSurface border-b border-outlineVariant pb-2">
            Assets Information ({assetData.length} assets)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surfaceContainer">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                    Asset ID
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                    Description
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                    Original Cost
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                    Disposal Value
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                    Disposal Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {assetData.map((asset, index) => (
                  <tr key={index} className="border-b border-outlineVariant">
                    <td className="px-3 py-2 text-sm text-onSurface">{asset.assetId}</td>
                    <td className="px-3 py-2 text-sm text-onSurface">{asset.assetDescription}</td>
                    <td className="px-3 py-2 text-sm text-onSurface">{formatCurrency(asset.originalCost)}</td>
                    <td className="px-3 py-2 text-sm text-onSurface">{formatCurrency(asset.disposalValue)}</td>
                    <td className="px-3 py-2 text-sm text-onSurface">{formatDate(asset.disposalDate)}</td>
                  </tr>
                ))}
                <tr className="bg-surfaceContainer font-semibold">
                  <td className="px-3 py-2 text-sm text-onSurface" colSpan={2}>TOTAL</td>
                  <td className="px-3 py-2 text-sm text-primary">
                    {formatCurrency(assetData.reduce((sum, asset) => sum + asset.originalCost, 0))}
                  </td>
                  <td className="px-3 py-2 text-sm text-primary">
                    {formatCurrency(assetData.reduce((sum, asset) => sum + asset.disposalValue, 0))}
                  </td>
                  <td className="px-3 py-2 text-sm text-onSurface">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      );
    } else {
      const asset = Array.isArray(assetData) ? assetData[0] : assetData;
      return (
        <Card className="space-y-4">
          <h4 className="font-medium text-onSurface border-b border-outlineVariant pb-2">
            Asset Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-onSurface mb-1">Asset ID:</label>
              <div className="text-sm text-onSurface">{asset.assetId}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-onSurface mb-1">Description:</label>
              <div className="text-sm text-onSurface">{asset.assetDescription}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-onSurface mb-1">Original Cost:</label>
              <div className="text-sm text-onSurface">{formatCurrency(asset.originalCost)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-onSurface mb-1">Disposal Value:</label>
              <div className="text-sm text-onSurface">{formatCurrency(asset.disposalValue)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-onSurface mb-1">Acquire Date:</label>
              <div className="text-sm text-onSurface">{formatDate(asset.acquireDate)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-onSurface mb-1">Disposal Date:</label>
              <div className="text-sm text-onSurface">{formatDate(asset.disposalDate)}</div>
            </div>
            {asset.recipient && (
              <div>
                <label className="block text-sm font-medium text-onSurface mb-1">Recipient:</label>
                <div className="text-sm text-onSurface">{asset.recipient}</div>
              </div>
            )}
          </div>
        </Card>
      );
    }
  };

  const renderCalculationResults = () => (
    <Card className="space-y-4">
      <div className="flex justify-between items-center border-b border-outlineVariant pb-2">
        <h4 className="font-medium text-onSurface">Calculation Results</h4>
        {showWorkingSheet && onViewWorkingSheet && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewWorkingSheet}
            className="text-xs"
          >
            View Working Sheet
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surfaceContainer p-4 rounded-md">
          <div className="text-sm text-onSurface mb-1">Written Down Value</div>
          <div className="text-lg font-semibold text-onSurface">
            {formatCurrency(calculationResults.writtenDownValue)}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
          <div className="text-sm text-blue-600 mb-1">Balancing Allowance</div>
          <div className="text-lg font-semibold text-blue-800">
            {calculationResults.balancingAllowance > 0 
              ? formatCurrency(calculationResults.balancingAllowance)
              : '-'
            }
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <div className="text-sm text-red-600 mb-1">Balancing Charge</div>
          <div className="text-lg font-semibold text-red-800">
            {calculationResults.balancingCharge > 0 
              ? formatCurrency(calculationResults.balancingCharge)
              : '-'
            }
          </div>
        </div>

        <div className={`border p-4 rounded-md ${
          calculationResults.netTaxEffect >= 0 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className={`text-sm mb-1 ${
            calculationResults.netTaxEffect >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            Net Tax Effect
          </div>
          <div className={`text-lg font-semibold ${
            calculationResults.netTaxEffect >= 0 ? 'text-green-800' : 'text-red-800'
          }`}>
            {formatCurrency(Math.abs(calculationResults.netTaxEffect))}
            <span className="text-xs ml-1">
              {calculationResults.netTaxEffect >= 0 ? '(Allowance)' : '(Charge)'}
            </span>
          </div>
        </div>
      </div>

      {calculationResults.clawbackAmount && calculationResults.clawbackAmount > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-red-800 mb-1">Clawback Amount</div>
              <div className="text-sm text-red-700">
                Additional charge due to disposal within 2 years of acquisition
              </div>
            </div>
            <div className="text-lg font-bold text-red-800">
              {formatCurrency(calculationResults.clawbackAmount)}
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-outlineVariant pt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-onSurface">Tax Treatment:</span>
          {getTaxTreatmentBadge(calculationResults.taxTreatment)}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-primary/5 border border-primary/20">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-primary">
              Disposal Summary - {getDisposalTypeLabel(disposalType)}
            </h3>
            <p className="text-sm text-outline mt-1">
              Review the disposal details and calculation results before confirming
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-outline">Status</div>
            <div className="text-lg font-semibold text-primary">Ready for Confirmation</div>
          </div>
        </div>
      </Card>

      {/* Asset Information */}
      {renderAssetInformation()}

      {/* Calculation Results */}
      {renderCalculationResults()}

      {/* Important Notes */}
      <Card className="bg-amber-50 border border-amber-200">
        <h4 className="font-medium text-amber-800 mb-2">Important Notes</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Please ensure all asset details and calculations are correct before confirming</li>
          <li>• Once confirmed, this disposal will be recorded in the system</li>
          <li>• Tax implications should be reviewed with your tax advisor</li>
          <li>• Proper documentation should be maintained for audit purposes</li>
          {calculationResults.clawbackAmount && calculationResults.clawbackAmount > 0 && (
            <li>• <strong>Clawback provisions apply</strong> - ensure compliance with tax regulations</li>
          )}
        </ul>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between space-x-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isConfirming}
          className="min-w-24"
        >
          Cancel
        </Button>
        
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={onEdit}
            disabled={isConfirming}
            className="min-w-24"
          >
            Edit Details
          </Button>
          
          <Button
            onClick={onConfirm}
            disabled={isConfirming}
            className="min-w-32"
          >
            {isConfirming ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Confirming...</span>
              </div>
            ) : (
              'Confirm Disposal'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DisposalSummary;
