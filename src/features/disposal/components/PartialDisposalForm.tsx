import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/components/Input';
import { Button } from '@/components/ui/components';
import Card from '@/components/ui/components/Card';

interface PartialDisposalFormData {
  assetId: string;
  acquireDate: string;
  disposalDate: string;
  disposalValue: number;
  disposedCost: number;
  originalCost: number;
  qualifyingExpenditure: number;
  residualExpenditure: number;
  recipient: string;
  isAssetScrapped: boolean;
  isControlledDisposal: boolean;
}

interface CalculationResults {
  disposalProportion: number;
  disposedQE: number;
  disposedRE: number;
}

interface PartialDisposalFormProps {
  data: PartialDisposalFormData;
  calculations: CalculationResults;
  onChange: (field: keyof PartialDisposalFormData, value: string | number | boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
  readOnly?: boolean;
}

const PartialDisposalForm: React.FC<PartialDisposalFormProps> = ({
  data,
  calculations,
  onChange,
  onNext,
  onPrevious,
  readOnly = false,
}) => {
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleInputChange = (field: keyof PartialDisposalFormData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === 'number' 
        ? parseFloat(e.target.value) || 0 
        : e.target.type === 'checkbox'
          ? e.target.checked
          : e.target.value;
      
      setLocalData(prev => ({ ...prev, [field]: value }));
      onChange(field, value);
    };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <Card className="space-y-6">
      <div className="border-b border-outlineVariant pb-4">
        <h3 className="text-lg font-semibold text-onSurface">Partial Disposal Details</h3>
      </div>

      {/* Asset Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="partial-asset-id" className="block text-sm font-medium text-gray-900">
            Asset ID
          </label>
          <Input
            id="partial-asset-id"
            type="text"
            value={localData.assetId}
            disabled={true}
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="partial-acquire-date" className="block text-sm font-medium text-onSurface">
            Acquire Date
          </label>
          <Input
            id="partial-acquire-date"
            type="date"
            value={localData.acquireDate}
            onChange={handleInputChange('acquireDate')}
            disabled={true}
            className="bg-surfaceContainer cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="partial-disposal-date" className="block text-sm font-medium text-onSurface">
            Disposal Date <span className="text-error">*</span>
          </label>
          <Input
            id="partial-disposal-date"
            type="date"
            value={localData.disposalDate}
            onChange={handleInputChange('disposalDate')}
            disabled={readOnly}
            required
          />
        </div>
      </div>

      {/* Financial Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="partial-disposal-value" className="block text-sm font-medium text-onSurface">
            Disposal Value <span className="text-error">*</span>
          </label>
          <Input
            id="partial-disposal-value"
            type="number"
            placeholder="0.00"
            step="0.01"
            value={localData.disposalValue}
            onChange={handleInputChange('disposalValue')}
            disabled={readOnly || localData.isAssetScrapped}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="partial-disposed-cost" className="block text-sm font-medium text-onSurface">
            Disposed Cost <span className="text-error">*</span>
          </label>
          <Input
            id="partial-disposed-cost"
            type="number"
            placeholder="0.00"
            step="0.01"
            value={localData.disposedCost}
            onChange={handleInputChange('disposedCost')}
            disabled={readOnly}
            required
          />
        </div>
      </div>

      {/* Calculation Results */}
      <div className="bg-surfaceContainer p-4 rounded-md">
        <h4 className="font-medium text-onSurface mb-4">Calculated Proportions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-sm text-onSurface">Disposal Proportion:</label>
            <div className="text-lg font-semibold text-primary">
              {formatPercentage(calculations.disposalProportion)}
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm text-onSurface">Disposed QE:</label>
            <div className="text-lg font-semibold text-primary">
              {formatCurrency(calculations.disposedQE)}
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm text-onSurface">Disposed RE:</label>
            <div className="text-lg font-semibold text-primary">
              {formatCurrency(calculations.disposedRE)}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="partial-recipient" className="block text-sm font-medium text-onSurface">
            Recipient
          </label>
          <Input
            id="partial-recipient"
            type="text"
            placeholder="Recipient name"
            value={localData.recipient}
            onChange={handleInputChange('recipient')}
            disabled={readOnly}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="partial-asset-scrapped"
              checked={localData.isAssetScrapped}
              onChange={handleInputChange('isAssetScrapped')}
              disabled={readOnly}
              className="w-4 h-4 text-primary border-outlineVariant focus:ring-primary rounded"
            />
            <label htmlFor="partial-asset-scrapped" className="text-sm text-onSurface">
              Asset Scrapped (Value = 0)
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="partial-controlled-disposal"
              checked={localData.isControlledDisposal}
              onChange={handleInputChange('isControlledDisposal')}
              disabled={readOnly}
              className="w-4 h-4 text-primary border-outlineVariant focus:ring-primary rounded"
            />
            <label htmlFor="partial-controlled-disposal" className="text-sm text-onSurface">
              Controlled Disposal (≥50% control)
            </label>
          </div>
        </div>
      </div>

      {/* Warning Messages */}
      {localData.isAssetScrapped && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
          <div className="flex">
            <div className="text-amber-600 text-sm">
              <strong>Note:</strong> Asset scrapped - disposal value is set to 0.
            </div>
          </div>
        </div>
      )}

      {localData.isControlledDisposal && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="text-blue-600 text-sm">
              <strong>Controlled Disposal:</strong> Special rules apply for controlled disposal transactions.
            </div>
          </div>
        </div>
      )}

      {!readOnly && (
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onPrevious}
            className="min-w-24"
          >
            Previous
          </Button>
          <Button
            onClick={onNext}
            className="min-w-24"
          >
            Next
          </Button>
        </div>
      )}
    </Card>
  );
};

export default PartialDisposalForm;
