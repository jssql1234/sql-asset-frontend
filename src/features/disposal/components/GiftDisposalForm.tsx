import React from 'react';
import { Input } from '@/components/ui/components/Input';
import { Button } from '@/components/ui/components';
import Card from '@/components/ui/components/Card';

interface GiftDisposalFormProps {
  data: {
    assetCode: string;
    acquireDate: string;
    disposalDate: string;
    recipient: string;
  };
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  disabled?: boolean;
}

const GiftDisposalForm: React.FC<GiftDisposalFormProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  disabled = false,
}) => {
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(field, e.target.value);
  };

  const isNextDisabled = !data.disposalDate;

  return (
    <Card className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">Gift to Approved Institutions</h3>
      </div>

      {/* Gift Disposal Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-blue-900">Gift to Approved Institutions</h4>
            <p className="text-sm text-blue-700 mt-1">
              Deemed disposal value = RM 0.00. No BA/BC calculation required.
            </p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="gift-asset-code" className="block text-sm font-medium text-gray-900">
            Asset ID
          </label>
          <Input
            id="gift-asset-code"
            type="text"
            value={data.assetCode}
            disabled={true}
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="gift-acquire-date" className="block text-sm font-medium text-gray-900">
            Acquire Date
          </label>
          <Input
            id="gift-acquire-date"
            type="date"
            value={data.acquireDate}
            disabled={true}
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="gift-disposal-date" className="block text-sm font-medium text-gray-900">
            Disposal Date <span className="text-red-600">*</span>
          </label>
          <Input
            id="gift-disposal-date"
            type="date"
            value={data.disposalDate}
            onChange={handleInputChange('disposalDate')}
            disabled={disabled}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="gift-recipient" className="block text-sm font-medium text-gray-900">
            Recipient (Approved Institution)
          </label>
          <Input
            id="gift-recipient"
            type="text"
            placeholder="Recipient name"
            value={data.recipient}
            onChange={handleInputChange('recipient')}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Disposal Value Display */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Disposal Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Disposal Value:</span>
            <span className="font-medium text-gray-900">RM 0.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Tax Treatment:</span>
            <span className="font-medium text-gray-900">No BA/BC calculation</span>
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

export default GiftDisposalForm;
