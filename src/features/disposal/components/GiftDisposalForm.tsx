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
      <div className="border-b border-outline pb-4">
        <h3 className="text-lg font-semibold text-onBackground">Gift to Approved Institutions</h3>
      </div>

      {/* Gift Disposal Notice */}
      <div className="bg-primaryContainer border border-primary rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-onPrimaryContainer mt-1">
              Deemed disposal value = RM 0.00. No BA/BC calculation required.
            </p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="gift-asset-code" className="block text-sm font-medium text-onBackground">
            Asset ID
          </label>
          <Input
            id="gift-asset-code"
            type="text"
            value={data.assetCode}
            disabled={true}
            className="bg-surfaceContainer cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="gift-acquire-date" className="block text-sm font-medium text-onBackground">
            Acquire Date
          </label>
          <Input
            id="gift-acquire-date"
            type="date"
            value={data.acquireDate}
            disabled={true}
            className="bg-surfaceContainer cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="gift-disposal-date" className="block text-sm font-medium text-onBackground">
            Disposal Date <span className="text-error">*</span>
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
          <label htmlFor="gift-recipient" className="block text-sm font-medium text-onBackground">
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
