import React from 'react';
import { Input } from '@/components/ui/components/Input';
import { Button } from '@/components/ui/components';
import Card from '@/components/ui/components/Card';

interface AgricultureDisposalFormProps {
  data: {
    assetCode: string;
    acquireDate: string;
    disposalDate: string;
    disposalValue: number;
    recipient: string;
    assetScrapped: boolean;
    controlledDisposal: boolean;
  };
  onChange: (field: string, value: string | number | boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
  disabled?: boolean;
}

const AgricultureDisposalForm: React.FC<AgricultureDisposalFormProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  disabled = false,
}) => {
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(field, value);
  };

  const handleCheckboxChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(field, e.target.checked);
  };

  const isNextDisabled = !data.disposalDate;

  return (
    <Card className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">Agriculture Disposal</h3>
      </div>

      {/* Agriculture Disposal Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-blue-900">Agriculture Disposal</h4>
            <p className="text-sm text-blue-700 mt-1">
              Disposal value will not affect BA/BC calculation.
            </p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="agriculture-asset-code" className="block text-sm font-medium text-gray-900">
            Asset ID
          </label>
          <Input
            id="agriculture-asset-code"
            type="text"
            value={data.assetCode}
            disabled={true}
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="agriculture-acquire-date" className="block text-sm font-medium text-gray-900">
            Acquire Date
          </label>
          <Input
            id="agriculture-acquire-date"
            type="date"
            value={data.acquireDate}
            disabled={true}
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="agriculture-disposal-date" className="block text-sm font-medium text-gray-900">
            Disposal Date <span className="text-red-600">*</span>
          </label>
          <Input
            id="agriculture-disposal-date"
            type="date"
            value={data.disposalDate}
            onChange={handleInputChange('disposalDate')}
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="agriculture-disposal-value" className="block text-sm font-medium text-gray-900">
            Disposal Value <span className="text-red-600">*</span>
          </label>
          <Input
            id="agriculture-disposal-value"
            type="number"
            placeholder="0.00"
            step="0.01"
            value={data.disposalValue}
            onChange={handleInputChange('disposalValue')}
            disabled={disabled || data.assetScrapped}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="agriculture-recipient" className="block text-sm font-medium text-gray-900">
            Recipient
          </label>
          <Input
            id="agriculture-recipient"
            type="text"
            placeholder="Recipient name"
            value={data.recipient}
            onChange={handleInputChange('recipient')}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="agriculture-asset-scrapped"
            checked={data.assetScrapped}
            onChange={handleCheckboxChange('assetScrapped')}
            disabled={disabled}
            className="w-4 h-4 text-primary border-outlineVariant focus:ring-primary"
          />
          <label htmlFor="agriculture-asset-scrapped" className="text-sm text-gray-900">
            Asset Scrapped (Value = 0)
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="agriculture-controlled-disposal"
            checked={data.controlledDisposal}
            onChange={handleCheckboxChange('controlledDisposal')}
            disabled={disabled}
            className="w-4 h-4 text-primary border-outlineVariant focus:ring-primary"
          />
          <label htmlFor="agriculture-controlled-disposal" className="text-sm text-gray-900">
            Controlled Disposal (≥50% control)
          </label>
        </div>
      </div>

      {/* Disposal Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Disposal Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Disposal Value:</span>
            <span className="font-medium text-gray-900">
              RM {(data.assetScrapped ? 0 : data.disposalValue).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Tax Treatment:</span>
            <span className="font-medium text-gray-900">No BA/BC impact</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Control Status:</span>
            <span className="font-medium text-gray-900">
              {data.controlledDisposal ? 'Controlled' : 'Uncontrolled'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Asset Status:</span>
            <span className="font-medium text-gray-900">
              {data.assetScrapped ? 'Scrapped' : 'Active'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={disabled}
          className="min-w-24"
        >
          Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={disabled || isNextDisabled}
          className="min-w-24"
        >
          Next
        </Button>
      </div>
    </Card>
  );
};

export default AgricultureDisposalForm;
