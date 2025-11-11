import React from 'react';
import { Input } from '@/components/ui/components/Input';
import { Button } from '@/components/ui/components';
import Card from '@/components/ui/components/Card';
import { SemiDatePicker } from '@/components/ui/components';  

interface AgricultureDisposalFormProps {
  data: {
    assetId: string;
    acquireDate: string;
    disposalDate: string;
    disposalValue: number;
    recipient: string;
    assetScrapped: boolean;
    controlledDisposal: boolean;
    allowanceApportionment: boolean;
    annualAllowance: number;
    apportionedAllowance: number;
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

  const handleDateChange = (field: string) => (date: string | Date | Date[] | string[] | undefined) => {
    let isoDate = '';
    if (date instanceof Date) {
      isoDate = date.toISOString();
    } else if (typeof date === 'string') {
      isoDate = date;
    }
    onChange(field, isoDate);
  };

  const isNextDisabled = !data.disposalDate;

  return (
    <Card className="space-y-6">
      <div className="border-b border-outline pb-4">
        <h3 className="text-lg font-semibold text-onBackground">Agriculture Disposal</h3>
      </div>

      {/* Agriculture Disposal Notice */}
      <div className="bg-primaryContainer border border-primary rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-onPrimaryContainer mt-1">
              Disposal value will not affect BA/BC calculation.
            </p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="agriculture-asset-code" className="block text-sm font-medium text-onBackground">
            Asset ID
          </label>
          <Input
            id="agriculture-asset-code"
            type="text"
            value={data.assetId}
            disabled={true}
            className="bg-surfaceContainer cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="agriculture-acquire-date" className="block text-sm font-medium text-onBackground">
            Acquire Date
          </label>
            <Input
            id="agriculture-acquire-date"
            type="date"
            value={data.acquireDate}
            disabled={true}
            className="bg-surfaceContainer cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="agriculture-disposal-date" className="block text-sm font-medium text-onBackground">
            Disposal Date <span className="text-error">*</span>
          </label>
          <SemiDatePicker
            value={data.disposalDate ? new Date(data.disposalDate) : null}
            onChange={handleDateChange('disposalDate')}
            inputType="date"
            disabled={disabled}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="agriculture-disposal-value" className="block text-sm font-medium text-onBackground">
            Disposal Value <span className="text-error">*</span>
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
          <label htmlFor="agriculture-recipient" className="block text-sm font-medium text-onBackground">
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
      <div className="space-y-4 mb-8">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="agriculture-asset-scrapped"
            checked={data.assetScrapped}
            onChange={handleCheckboxChange('assetScrapped')}
            disabled={disabled}
            className="w-4 h-4 text-primary border-outlineVariant focus:ring-primary"
          />
          <label htmlFor="agriculture-asset-scrapped" className="text-sm text-onBackground">
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
          <label htmlFor="agriculture-controlled-disposal" className="text-sm text-onBackground">
            Controlled Disposal (≥50% control)
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="agriculture-allowance-apportionment"
            checked={data.allowanceApportionment}
            onChange={handleCheckboxChange('allowanceApportionment')}
            disabled={disabled}
            className="w-4 h-4 text-primary border-outlineVariant focus:ring-primary"
          />
          <label htmlFor="agriculture-allowance-apportionment" className="text-sm text-onBackground">
            Allowance Apportionment
          </label>
        </div>
      </div>



      {/* Warning Messages */}
      {data.assetScrapped && (
        <div className="bg-warningContainer border border-warning rounded-md p-4">
           <div className="text-onWarningContainer text-sm">
              <strong>Note:</strong> Asset scrapped - disposal value is set to 0.
           </div>
        </div>
      )}

      {data.controlledDisposal && (
        <div className="bg-primaryContainer border border-primary rounded-md p-4">
            <div className="text-onPrimaryContainer text-sm">
                Special rules apply for controlled disposal transactions.
            </div>
       </div>
      )}

      {/* Allowance Group - Display Only */}
      {data.allowanceApportionment && (
        <div className="bg-surfaceContainer border border-outline rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface rounded-lg p-3 border border-outlineVariant">
              <div className="text-xs font-medium text-onSurfaceVariant uppercase tracking-wide mb-1">
                Annual Allowance
              </div>
              <div className="text-lg font-semibold text-onSurface">
                RM {data.annualAllowance ? data.annualAllowance.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '137,500'}
              </div>
            </div>

            <div className="bg-surface rounded-lg p-3 border border-outlineVariant">
              <div className="text-xs font-medium text-onSurfaceVariant uppercase tracking-wide mb-1">
                Apportioned Allowance
              </div>
              <div className="text-lg font-semibold text-onSurface">
                RM {data.apportionedAllowance ? data.apportionedAllowance.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '61,612'}
              </div>
            </div>
          </div>
        </div>
      )}

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
