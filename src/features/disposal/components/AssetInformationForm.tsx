import React from 'react';
import { Input } from '@/components/ui/components/Input';
import { Button } from '@/components/ui/components';
import Card from '@/components/ui/components/Card';

interface AssetInformationFormProps {
  data: {
    assetCode: string;
    assetDescription: string;
    originalCost: number;
    qualifyingExpenditure: number;
    residualExpenditure: number;
    totalCAClaimed: number;
    purchaseDate: string;
    disposalDate: string;
  };
  onChange: (field: string, value: string | number) => void;
  onNext: () => void;
  onPrevious: () => void;
  readOnly?: boolean;
}

const AssetInformationForm: React.FC<AssetInformationFormProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  readOnly = false,
}) => {
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(field, value);
  };

  return (
    <Card className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">Asset Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="asset-code" className="block text-sm font-medium text-gray-900">
            Asset ID
          </label>
          <Input
            id="asset-code"
            type="text"
            value={data.assetCode}
            disabled={true}
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="asset-description" className="block text-sm font-medium text-gray-900">
            Description
          </label>
          <Input
            id="asset-description"
            type="text"
            placeholder="Asset description"
            value={data.assetDescription}
            onChange={handleInputChange('assetDescription')}
            disabled={readOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="original-cost" className="block text-sm font-medium text-gray-900">
            Original Cost <span className="text-red-600">*</span>
          </label>
          <Input
            id="original-cost"
            type="number"
            placeholder="0.00"
            step="0.01"
            value={data.originalCost}
            onChange={handleInputChange('originalCost')}
            disabled={readOnly}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="qualifying-expenditure" className="block text-sm font-medium text-gray-900">
            Qualifying Expenditure (QE) <span className="text-red-600">*</span>
          </label>
          <Input
            id="qualifying-expenditure"
            type="number"
            placeholder="0.00"
            step="0.01"
            value={data.qualifyingExpenditure}
            onChange={handleInputChange('qualifyingExpenditure')}
            disabled={readOnly}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="residual-expenditure" className="block text-sm font-medium text-gray-900">
            Residual Expenditure (RE) <span className="text-red-600">*</span>
          </label>
          <Input
            id="residual-expenditure"
            type="number"
            placeholder="0.00"
            step="0.01"
            value={data.residualExpenditure}
            onChange={handleInputChange('residualExpenditure')}
            disabled={readOnly}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="total-ca-claimed" className="block text-sm font-medium text-gray-900">
            Total Capital Allowance Claimed <span className="text-red-600">*</span>
          </label>
          <Input
            id="total-ca-claimed"
            type="number"
            placeholder="0.00"
            step="0.01"
            value={data.totalCAClaimed}
            onChange={handleInputChange('totalCAClaimed')}
            disabled={readOnly}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="purchase-date" className="block text-sm font-medium text-gray-900">
            Purchase Date
          </label>
          <Input
            id="purchase-date"
            type="date"
            value={data.purchaseDate}
            onChange={handleInputChange('purchaseDate')}
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="disposal-date" className="block text-sm font-medium text-gray-900">
            Disposal Date <span className="text-red-600">*</span>
          </label>
          <Input
            id="disposal-date"
            type="date"
            value={data.disposalDate}
            onChange={handleInputChange('disposalDate')}
            disabled={readOnly}
            required
          />
        </div>
      </div>

      {!readOnly && (
        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={onPrevious} 
            className="min-w-24"
          >
            Previous
          </Button>
          <Button onClick={onNext} className="min-w-24">
            Next
          </Button>
        </div>
      )}
    </Card>
  );
};

export default AssetInformationForm;
